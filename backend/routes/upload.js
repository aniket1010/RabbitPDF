const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const prisma = require('../prismaClient');
const { getBatchEmbeddings } = require('../services/embedding');
const { batchUpsertEmbeddings } = require('../services/pinecone');
const { validatePDF } = require('../middleware/validation');
const { verifyAuth } = require('../utils/auth');
// Note: Removed heavy text splitter dependency; using lightweight chunking
const path = require('path');
const fs = require('fs');

// Set up Multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });
const router = express.Router();

// Lightweight per-page chunking (no coordinates)
function chunkPdfByPage(pageTexts, conversationId) {
    if (!Array.isArray(pageTexts) || pageTexts.length === 0) {
        console.error(`❌ [${conversationId}] No page texts available for chunking.`);
        return [];
    }

    const MIN_CHUNK_LENGTH = 80; // ignore tiny fragments
    const TARGET_LEN = 1000; // characters per chunk
    const OVERLAP = 120; // characters overlap when slicing long paragraphs

    const chunks = [];

    pageTexts.forEach((page, idx) => {
        if (!page || !page.text || !page.text.trim()) return;
        const pageNumber = page.pageNumber || (idx + 1);
        const sectionTitle = deriveSectionTitle(page.text);

        // Split by paragraph breaks (two or more newlines)
        const paragraphs = page.text.split(/\n\s*\n+/);
        let buffer = '';

        const flushBuffer = () => {
            const text = buffer.replace(/\s+/g, ' ').trim();
            if (text.length >= MIN_CHUNK_LENGTH) {
                chunks.push({ text, pageNumber, sectionTitle });
            }
            buffer = '';
        };

        for (const para of paragraphs) {
            const paraText = para.replace(/\s+/g, ' ').trim();
            if (!paraText) continue;

            if ((buffer + ' ' + paraText).length <= TARGET_LEN) {
                buffer = (buffer ? buffer + ' ' : '') + paraText;
            } else {
                if (buffer) flushBuffer();
                // If a single paragraph is too long, hard-split with overlap
                let start = 0;
                while (start < paraText.length) {
                    const end = Math.min(start + TARGET_LEN, paraText.length);
                    const slice = paraText.slice(start, end);
                    const text = slice.replace(/\s+/g, ' ').trim();
                    if (text.length >= MIN_CHUNK_LENGTH) {
                        chunks.push({ text, pageNumber, sectionTitle });
                    }
                    if (end >= paraText.length) break;
                    start = Math.max(0, end - OVERLAP);
                }
            }
        }

        if (buffer) flushBuffer();
    });

    return chunks;
}

// Simple heuristic: take the first line if it looks like a heading (short, Title Case)
function deriveSectionTitle(pageText) {
    try {
        if (!pageText) return '';
        const firstLine = String(pageText).split(/\n/)[0].trim();
        if (!firstLine) return '';
        if (firstLine.length > 120) return '';
        const looksLikeTitle = /[A-Za-z]/.test(firstLine) && firstLine.split(' ').filter(Boolean).length <= 12;
        return looksLikeTitle ? firstLine : '';
    } catch {
        return '';
    }
}

router.post('/', verifyAuth, upload.single('file'), validatePDF, async (req, res) => {
  let conversation;

  try {
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const mimetype = req.file.mimetype;
    const size = req.file.size;

    // Defer PDF parsing to background for faster response

    // Create conversation immediately with user ID
    // Validate required user information
    if (!req.userId || !req.userEmail) {
      throw new Error('Missing required user information from authentication token');
    }
    
    // First, ensure the user exists in the database
    let user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (!user) {
      try {
        // Create user if they don't exist
        user = await prisma.user.create({
          data: {
            id: req.userId,
            email: req.userEmail,
            name: req.userName || 'User',
            emailVerified: new Date(), // Mark as verified since they signed in via OAuth
          }
        });
      } catch (userCreateError) {
        console.error('❌ [Upload] Failed to create user:', userCreateError);
        
        // Handle unique constraint error on email
        if (userCreateError.code === 'P2002' && userCreateError.meta?.target?.includes('email')) {
          user = await prisma.user.findUnique({
            where: { email: req.userEmail }
          });
          
          if (!user) {
            console.error('❌ [Upload] Could not find user by email after constraint error');
            throw new Error('User creation failed due to email conflict, but user not found');
          }
        } else {
          throw new Error(`Failed to create user: ${userCreateError.message}`);
        }
      }
    }
    
    // Ensure we have a valid user before proceeding
    if (!user || !user.id) {
      throw new Error('Failed to create or find user in database');
    }
    
    try {
      conversation = await prisma.conversation.create({
        data: {
          title: originalName,
          fileName: originalName,
          filePath: filePath,
          userId: user.id, // ← Use the actual user ID from the database
          processingStatus: 'pending'
        }
      });
    } catch (conversationError) {
      console.error('❌ [Upload] Failed to create conversation:', conversationError);
      throw conversationError;
    }
    
    // Return conversation ID immediately
    res.json({ conversationId: conversation.id });

    // Start background processing (feature-flag scaffold for future queue)
    const useQueue = String(process.env.USE_QUEUE).toLowerCase() === 'true';
    if (useQueue) {
      console.log(`🚧 [Upload] USE_QUEUE enabled, enqueuing process for conversation ${conversation.id}`);
      try {
        const { pdfProcessingQueue } = require('../queues/pdfProcessingQueue');
        await pdfProcessingQueue.add(
          'process-pdf',
          { filePath, conversationId: conversation.id, originalName },
          { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
        );
      } catch (e) {
        console.warn('⚠️ [Upload] Queue unavailable, falling back to inline processing:', e?.message);
        processPdfInBackground(filePath, conversation.id, originalName);
      }
    } else {
      processPdfInBackground(filePath, conversation.id, originalName);
    }

  } catch (error) {
    console.error('❌ PDF upload failed:', error);
    
    if (conversation && conversation.id) {
      try {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { 
            processingStatus: 'failed'
          }
        });
      } catch (updateError) {
        console.error('❌ Error updating failed status:', updateError);
      }
    }
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error processing PDF file', details: error.message });
    }
  }
});

// Asynchronous background processing function (kept for fallback)
async function processPdfInBackground(filePath, conversationId, originalName) {
    try {
        // Set status to processing
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { processingStatus: 'processing' }
        });

        // Read and parse PDF (async, non-blocking)
        const dataBuffer = await fs.promises.readFile(filePath);
        const localPageTexts = [];
        const data = await pdfParse(dataBuffer, {
            max: 0,
            pagerender: createRenderPage(localPageTexts)
        });

        const docText = (data.text || '').trim();
        if (!docText) {
            console.error(`❌ [${conversationId}] No text content found in PDF`);
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { processingStatus: 'failed' }
            });
            return;
        }

        // Build page texts and chunk per page (no coordinates)
        const pageChunks = chunkPdfByPage(localPageTexts, conversationId);
        const chunks = pageChunks.map(c => c.text);

        // Generate embeddings
        const embeddings = await getBatchEmbeddings(chunks);
        const embeddingResults = embeddings.map((embedding, index) => ({
            embedding,
            chunk: chunks[index],
            pageNumber: pageChunks[index]?.pageNumber || 1,
            chunkIndex: index
        }));

        // Upsert to Pinecone with minimal metadata
        const vectorDataArray = embeddingResults.map((result) => ({
            id: `${conversationId}-${result.chunkIndex}`,
            vector: result.embedding,
            text: result.chunk,
            conversationId: conversationId,
            pageNumber: result.pageNumber,
            chunkIndex: result.chunkIndex,
            sectionTitle: pageChunks[result.chunkIndex]?.sectionTitle || ''
        }));
        
        await batchUpsertEmbeddings(vectorDataArray);

        // Mark as completed
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { processingStatus: 'completed' }
        });
        
        // Emit WebSocket event: PDF processing complete
        const { MessageEvents } = require('../websocket');
        MessageEvents.PDF_PROCESSING_COMPLETE(conversationId);
        
        // Process pending messages (non-queue path)
        try {
          const { processAndRespondToMessage } = require('../services/messageProcessor');
          const pendingMessages = await prisma.message.findMany({
            where: { conversationId, status: 'pending', role: 'user' },
            orderBy: { createdAt: 'asc' },
          });
          
          console.log(`🔄 [Upload] Processing ${pendingMessages.length} pending messages`);
          
          for (const message of pendingMessages) {
            await processAndRespondToMessage(message);
          }
        } catch (messageError) {
          console.error(`❌ [Upload] Error processing pending messages:`, messageError);
        }
        
        // Optional: Test reference accuracy in development
        if (process.env.NODE_ENV !== 'production') {
            try {
                await testReferenceAccuracy(conversationId, Math.min(10, chunks.length));
            } catch (testError) {
                console.warn(`🧪 [${conversationId}] Reference accuracy test failed:`, testError.message);
            }
        }

    } catch (error) {
        console.error(`❌ [${conversationId}] Background processing failed:`, error);
        
        try {
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { 
                    processingStatus: 'failed'
                }
            });
        } catch (updateError) {
            console.error(`❌ [${conversationId}] Error updating failed status:`, updateError);
        }
    }
}



// Enhanced PDF page renderer function with position tracking
function createRenderPage(pageTexts) {
    return function renderPage(pageData) {
        return pageData.getTextContent()
            .then(function(textContent) {
                let lastY, text = '';
                for (let item of textContent.items) {
                    if (lastY != item.transform[5] && text) {
                        text += '\n';
                    }
                    // Normalize hyphenated line breaks: "word-\nnext" -> "wordnext"
                    const normalized = String(item.str)
                        .replace(/\s+/g, ' ');
                    text += normalized;
                    lastY = item.transform[5];
                }
                pageTexts[pageData.pageIndex] = {
                    pageNumber: pageData.pageIndex + 1,
                    text
                };
                return text;
            });
    }
}

module.exports = router;
// Testing utility for reference validation (development use)
async function testReferenceAccuracy(conversationId, sampleSize = 10) {
    if (process.env.NODE_ENV === 'production') {
        return;
    }

    console.log(`🧪 [Testing] Starting reference accuracy test for conversation ${conversationId}`);    try {
        // Get sample chunks from Pinecone
        const { queryEmbedding } = require('../services/pinecone');
        const sampleEmbedding = Array(1536).fill(0.01); // Dummy embedding for testing
        const matches = await queryEmbedding(sampleEmbedding, sampleSize, conversationId);
        
        let totalTests = 0;
        let passedTests = 0;
        let confidenceSum = 0;
        
        for (const match of matches) {
            if (!match.metadata) continue;
            
            totalTests++;
            const metadata = match.metadata;
            
            // Test 1: Valid page number
            const validPageNumber = metadata.pageNumber && 
                                  Number.isInteger(metadata.pageNumber) && 
                                  metadata.pageNumber > 0;
            
            // Test 2: Valid position
            const validPosition = metadata.pagePosition >= 0;
            
            // Test 3: Has confidence score
            const hasConfidence = metadata.confidence !== undefined;
            
            // Test 4: Text quality
            const hasGoodText = metadata.text && metadata.text.length > 10;
            
            const testsPassed = [validPageNumber, validPosition, hasConfidence, hasGoodText]
                .filter(Boolean).length;
            
            if (testsPassed >= 3) {
                passedTests++;
            }
            
            confidenceSum += metadata.confidence || 0;
        }
        
        const avgConfidence = totalTests > 0 ? confidenceSum / totalTests : 0;
        const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        
        return {
            totalTests,
            passedTests,
            passRate,
            avgConfidence,
            recommendation: passRate >= 80 ? '✅ Good' : passRate >= 60 ? '⚠️ Fair' : '❌ Needs improvement'
        };
        
    } catch (error) {
        console.error('🧪 [Testing] Reference accuracy test failed:', error);
        return null;
    }
}

// Export testing utility for development use
if (process.env.NODE_ENV !== 'production') {
    module.exports.testReferenceAccuracy = testReferenceAccuracy;
}

