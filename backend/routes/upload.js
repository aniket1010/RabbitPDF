const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const prisma = require('../prismaClient');
const { getBatchEmbeddings } = require('../services/embedding');
const { batchUpsertEmbeddings } = require('../services/pinecone');
const { validatePDF } = require('../middleware/validation');
const { verifyAuth } = require('../utils/auth');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
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

// New robust chunking function using coordinates from pdf.js
function chunkPdfWithCoordinates(pageInfo, conversationId) {
    console.log(`🧠 [${conversationId}] Starting coordinate-based chunking for ${pageInfo.length} pages.`);
    const allChunks = [];

    if (!pageInfo || pageInfo.length === 0) {
        console.error(`❌ [${conversationId}] No page info available for coordinate-based chunking.`);
        return [];
    }

    const MIN_CHUNK_LENGTH = 40; // Chunks with less than 40 chars are likely noise.
    const PARA_BREAK_THRESHOLD = 1.5; // If vertical gap is > 1.5x line height, it's a new paragraph.

    pageInfo.forEach((page, pageIndex) => {
        if (!page || !page.textItems || page.textItems.length === 0) {
            return;
        }

        // Sort text items by Y, then X, to ensure correct reading order
        const sortedItems = [...page.textItems].sort((a, b) => {
            if (Math.abs(a.y - b.y) > 5) { // Group by line
                return b.y - a.y; // Higher Y is higher on page
            }
            return a.x - b.x; // Then left-to-right
        });

        let currentChunk = {
            text: '',
            pageNumber: pageIndex + 1,
            items: [],
        };

        for (let i = 0; i < sortedItems.length; i++) {
            const item = sortedItems[i];
            const prevItem = i > 0 ? sortedItems[i-1] : null;
            
            let isNewParagraph = false;
            if (prevItem) {
                const verticalGap = Math.abs(item.y - prevItem.y);
                const avgLineHeight = (item.height + prevItem.height) / 2 || item.height;
                
                if (verticalGap > avgLineHeight * PARA_BREAK_THRESHOLD) {
                    isNewParagraph = true;
                }
            }

            if (isNewParagraph) {
                // Finalize previous chunk
                const trimmedText = currentChunk.text.replace(/\s+/g, ' ').trim();
                if (trimmedText.length >= MIN_CHUNK_LENGTH) {
                    // Consolidate coordinates before pushing
                    currentChunk.coordinates = currentChunk.items.map(it => ({
                        x: it.x, y: it.y, width: it.width, height: it.height
                    }));
                    delete currentChunk.items;
                    currentChunk.text = trimmedText;
                    allChunks.push(currentChunk);
                }
                // Start new chunk
                currentChunk = { text: '', pageNumber: pageIndex + 1, items: [] };
            }

            currentChunk.text += item.text + ' ';
            currentChunk.items.push(item);
        }
        
        // Finalize the last chunk on the page
        const trimmedText = currentChunk.text.replace(/\s+/g, ' ').trim();
        if (trimmedText.length >= MIN_CHUNK_LENGTH) {
            currentChunk.coordinates = currentChunk.items.map(it => ({
                x: it.x, y: it.y, width: it.width, height: it.height
            }));
            delete currentChunk.items;
            currentChunk.text = trimmedText;
            allChunks.push(currentChunk);
        }
    });

    console.log(`✅ [${conversationId}] Coordinate-based chunking complete. Generated ${allChunks.length} chunks.`);
    return allChunks;
}

router.post('/', verifyAuth, upload.single('file'), validatePDF, async (req, res) => {
  console.log('\n📤 === PDF UPLOAD STARTED ===');
  let conversation;

  try {
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const mimetype = req.file.mimetype;
    const size = req.file.size;

    console.log('📄 File details:', { originalName, mimetype, size: `${(size / 1024 / 1024).toFixed(2)}MB` });

    // Parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer, {
      max: 0, // No page limit
      pagerender: renderPage
    });

    const text = data.text.trim();
    if (!text) {
      return res.status(400).json({ error: 'No text content found in PDF' });
    }
    console.log(`📊 Extracted ${text.length.toLocaleString()} characters of text`);

    // Create conversation immediately with user ID
    console.log('📋 [Upload] Creating conversation for user:', req.userId);
    console.log('📋 [Upload] User details:', { id: req.userId, email: req.userEmail, name: req.userName });
    
    // Validate required user information
    if (!req.userId || !req.userEmail) {
      throw new Error('Missing required user information from authentication token');
    }
    
    // First, ensure the user exists in the database
    let user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    console.log('📋 [Upload] User found in database:', !!user);
    
    if (!user) {
      console.log('👤 [Upload] User not found in database, creating user:', req.userId);
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
        console.log('✅ [Upload] User created successfully:', user.email);
      } catch (userCreateError) {
        console.error('❌ [Upload] Failed to create user:', userCreateError);
        console.error('❌ [Upload] Error details:', {
          code: userCreateError.code,
          meta: userCreateError.meta,
          message: userCreateError.message
        });
        
        // Handle unique constraint error on email
        if (userCreateError.code === 'P2002' && userCreateError.meta?.target?.includes('email')) {
          console.log('📧 [Upload] User with this email already exists, fetching existing user');
          user = await prisma.user.findUnique({
            where: { email: req.userEmail }
          });
          
          if (user) {
            console.log('✅ [Upload] Found existing user by email:', user.email);
          } else {
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
      console.log('📋 [Upload] Creating conversation with userId:', user.id);
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
      console.error('❌ [Upload] User ID that failed:', user.id);
      console.error('❌ [Upload] User exists in DB:', !!user);
      throw conversationError;
    }

    console.log(`🆔 Created conversation: ${conversation.id}`);
    
    // Return conversation ID immediately
    res.json({ conversationId: conversation.id });

    // Start background processing
    processPdfInBackground(text, conversation.id, originalName);

  } catch (error) {
    console.error('\n❌ === PDF UPLOAD FAILED ===');
    console.error('💥 Error in upload route:', error);
    
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

// Asynchronous background processing function
async function processPdfInBackground(text, conversationId, originalName) {
    console.log(`\n🔄 [${conversationId}] === BACKGROUND PROCESSING STARTED ===`);
    console.log(`📄 [${conversationId}] Processing: ${originalName}`);
    
    try {
        // Set status to processing
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { processingStatus: 'processing' }
        });

        // Text chunking with new coordinate-based method
        console.log(`📝 [${conversationId}] Starting coordinate-based chunking...`);
        const coordinateChunks = chunkPdfWithCoordinates(global.pdfPageInfo || [], conversationId);
        const chunks = coordinateChunks.map(chunk => chunk.text); // For embedding
        
        // Add debugging for page info state
        if (!global.pdfPageInfo || global.pdfPageInfo.length === 0) {
            console.error(`❌ [${conversationId}] CRITICAL: PDF page info missing during chunking!`);
        }

        // Generate embeddings
        const embeddings = await getBatchEmbeddings(chunks);
        const embeddingResults = embeddings.map((embedding, index) => ({
            embedding,
            chunk: chunks[index],
            ...coordinateChunks[index],
            index
        }));
        console.log(`🧠 [${conversationId}] Generated ${embeddingResults.length} embeddings`);

        // Upsert to Pinecone with coordinate metadata
        const vectorDataArray = embeddingResults.map((result) => ({
            id: `${conversationId}-${result.index}`,
            vector: result.embedding,
            text: result.chunk,
            conversationId: conversationId,
            pageNumber: result.pageNumber,
            // Convert to string for Pinecone
            coordinates: JSON.stringify(result.coordinates)
        }));
        
        await batchUpsertEmbeddings(vectorDataArray);
        console.log(`📤 [${conversationId}] Upserted ${vectorDataArray.length} vectors to Pinecone`);

        // Mark as completed
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { processingStatus: 'completed' }
        });

        console.log(`✅ [${conversationId}] Background processing completed successfully`);
        console.log(`📊 [${conversationId}] Final stats: ${chunks.length} chunks, ${embeddingResults.length} embeddings, ${vectorDataArray.length} vectors`);
        
        // Emit WebSocket event: PDF processing complete
        const { MessageEvents } = require('../websocket');
        MessageEvents.PDF_PROCESSING_COMPLETE(conversationId);
        
        // Process any pending messages
        await processPendingMessages(conversationId);
        
        // Optional: Test reference accuracy in development
        if (process.env.NODE_ENV !== 'production') {
            try {
                console.log(`🧪 [${conversationId}] Running reference accuracy test...`);
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

// Process pending messages when processing completes
async function processPendingMessages(conversationId) {
    try {
        const pendingMessages = await prisma.message.findMany({
            where: {
                conversationId: conversationId,
                status: 'pending',
                role: 'user'
            },
            orderBy: { createdAt: 'asc' }
        });

        console.log(`📝 [${conversationId}] Processing ${pendingMessages.length} pending messages`);

        const { processAndRespondToMessage } = require('../services/messageProcessor');

        for (const message of pendingMessages) {
            try {
                console.log(`📝 [${conversationId}] Processing pending message: ${message.id} - "${message.text}"`);
                const assistantMessage = await processAndRespondToMessage(message);
                if (assistantMessage) {
                    console.log(`✅ [${conversationId}] Successfully processed pending message ${message.id}, created assistant message ${assistantMessage.id}`);
                } else {
                    console.log(`❌ [${conversationId}] Failed to create assistant response for pending message ${message.id}`);
                }
            } catch (error) {
                console.error(`❌ [${conversationId}] Error processing pending message ${message.id}:`, error);
                // Mark message as error
                await prisma.message.update({
                    where: { id: message.id },
                    data: { status: 'error', error: error.message }
                });
            }
        }
        
        if (pendingMessages.length > 0) {
            console.log(`✅ [${conversationId}] Finished processing ${pendingMessages.length} pending messages`);
        }
    } catch (error) {
        console.error(`❌ [${conversationId}] Error processing pending messages:`, error);
    }
}

// Enhanced PDF page renderer function with position tracking
function renderPage(pageData) {
    return pageData.getTextContent()
        .then(function(textContent) {
            let lastY, text = '';
            const pageInfo = {
                pageNumber: pageData.pageIndex + 1, // 1-based page numbering
                textItems: []
            };
            
            for (let item of textContent.items) {
                if (lastY != item.transform[5] && text) {
                    text += '\n';
                }
                
                // Store position information for each text item
                pageInfo.textItems.push({
                    text: item.str,
                    x: item.transform[4],
                    y: item.transform[5],
                    width: item.width,
                    height: item.height
                });
                
                text += item.str;
                lastY = item.transform[5];
            }
            
            // Store page info in global object with timestamp for debugging
            if (!global.pdfPageInfo) global.pdfPageInfo = [];
            global.pdfPageInfo[pageData.pageIndex] = pageInfo;
            global.pdfPageInfoTimestamp = Date.now(); // Track when this was set
            
            console.log(`📄 [PDF] Parsed page ${pageInfo.pageNumber}: ${text.length} chars, ${pageInfo.textItems.length} text items`);
            
            return text;
        });
}

module.exports = router;
// Testing utility for reference validation (development use)
async function testReferenceAccuracy(conversationId, sampleSize = 10) {
    if (process.env.NODE_ENV === 'production') {
        console.log('🧪 [Testing] Reference testing disabled in production');
        return;
    }
    
    console.log(`🧪 [Testing] Starting reference accuracy test for conversation ${conversationId}`);
    
    try {
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
            
            console.log(`🧪 [Testing] Chunk ${metadata.chunkId}: ${testsPassed}/4 tests passed, confidence: ${(metadata.confidence || 0).toFixed(3)}`);
        }
        
        const avgConfidence = totalTests > 0 ? confidenceSum / totalTests : 0;
        const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        
        console.log(`🧪 [Testing] Reference Accuracy Results:`);
        console.log(`  • Tests passed: ${passedTests}/${totalTests} (${passRate.toFixed(1)}%)`);
        console.log(`  • Average confidence: ${avgConfidence.toFixed(3)}`);
        console.log(`  • Recommendation: ${passRate >= 80 ? '✅ Good' : passRate >= 60 ? '⚠️ Fair' : '❌ Needs improvement'}`);
        
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

