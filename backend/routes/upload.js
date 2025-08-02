const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const prisma = require('../prismaClient');
const { getBatchEmbeddings } = require('../services/embedding');
const { batchUpsertEmbeddings } = require('../services/pinecone');
const { generatePDFSummary } = require('../services/pdfSummary');
const { processSummaryContent } = require('../services/messageProcessor');
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

// Initialize LangChain text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,      // 1000 characters per chunk
  chunkOverlap: 100,    // 100 characters overlap between chunks
  separators: ["\n\n", "\n", ". ", " ", ""], // Try these separators in order
});

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

    // Generate summary in background
    let summaryData = {};
    let processedSummary = {};
    try {
      summaryData = await generatePDFSummary(text, originalName);
      if (summaryData.summary) {
        processedSummary = await processSummaryContent(summaryData);
      }
    } catch (error) {
      console.error('❌ Failed to generate summary, proceeding without it:', error);
    }

    // Create conversation immediately with user ID
    console.log('📋 [Upload] Creating conversation for user:', req.userId);
    console.log('📋 [Upload] User details:', { id: req.userId, email: req.userEmail, name: req.userName });
    
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
            email: req.userEmail || `user-${req.userId}@example.com`,
            name: req.userName || 'Anonymous User',
            emailVerified: new Date(), // Mark as verified since they signed in via OAuth
          }
        });
        console.log('✅ [Upload] User created successfully:', user.email);
      } catch (userCreateError) {
        // Handle unique constraint error on email
        if (userCreateError.code === 'P2002' && userCreateError.meta?.target?.includes('email')) {
          console.log('📧 [Upload] User with this email already exists, fetching existing user');
          // Try to find user by email since that's what's causing the conflict
          const email = req.userEmail || `user-${req.userId}@example.com`;
          user = await prisma.user.findUnique({
            where: { email: email }
          });
          
          if (user) {
            console.log('✅ [Upload] Found existing user by email:', user.email);
          } else {
            console.error('❌ [Upload] Could not find user by email after constraint error');
            throw userCreateError;
          }
        } else {
          console.error('❌ [Upload] Failed to create user:', userCreateError);
          throw userCreateError;
        }
      }
    }
    
    try {
      console.log('📋 [Upload] Creating conversation with userId:', req.userId);
      conversation = await prisma.conversation.create({
        data: {
          title: originalName,
          fileName: originalName,
          filePath: filePath,
          userId: req.userId, // ← Link conversation to authenticated user
          summary: summaryData.summary || 'Processing PDF...',
          summaryFormatted: processedSummary.summaryFormatted || null,
          commonQuestions: summaryData.commonQuestions || null,
          commonQuestionsFormatted: processedSummary.commonQuestionsFormatted || null,
          summaryContentType: processedSummary.summaryContentType || 'text',
          summaryGeneratedAt: summaryData.summary ? new Date() : null,
          summaryProcessedAt: processedSummary.summaryProcessedAt || null,
          processingStatus: 'pending'
        }
      });
    } catch (conversationError) {
      console.error('❌ [Upload] Failed to create conversation:', conversationError);
      console.error('❌ [Upload] User ID that failed:', req.userId);
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
            processingStatus: 'failed',
            summary: 'Processing failed. Please try again.'
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

        // Text chunking with page tracking
        const chunks = await textSplitter.splitText(text);
        console.log(`📊 [${conversationId}] Created ${chunks.length} chunks`);
        
        // Map chunks to page numbers
        const chunksWithPageInfo = mapChunksToPages(chunks, text, global.pdfPageInfo || []);
        
        // Add debugging for page info state
        if (!global.pdfPageInfo || global.pdfPageInfo.length === 0) {
            console.error(`❌ [${conversationId}] CRITICAL: PDF page info missing during chunk mapping!`);
            console.error(`❌ [${conversationId}] This will cause all references to point to page 1`);
            console.error(`❌ [${conversationId}] Page info timestamp:`, global.pdfPageInfoTimestamp || 'never set');
        } else {
            console.log(`✅ [${conversationId}] PDF page info available: ${global.pdfPageInfo.length} pages`);
            if (global.pdfPageInfoTimestamp) {
                const ageSeconds = (Date.now() - global.pdfPageInfoTimestamp) / 1000;
                console.log(`📅 [${conversationId}] Page info age: ${ageSeconds.toFixed(1)} seconds`);
            }
        }
        
        console.log(`📍 [${conversationId}] Mapped chunks to pages`);

        // Generate embeddings
        const embeddings = await getBatchEmbeddings(chunks);
        const embeddingResults = embeddings.map((embedding, index) => ({
            embedding,
            chunk: chunks[index],
            pageInfo: chunksWithPageInfo[index],
            index
        }));
        console.log(`🧠 [${conversationId}] Generated ${embeddingResults.length} embeddings`);

        // Upsert to Pinecone with enhanced page information and metadata
        const vectorDataArray = embeddingResults.map((result) => ({
            id: `${conversationId}-${result.index}`,
            vector: result.embedding,
            text: result.chunk,
            conversationId: conversationId,
            pageNumber: result.pageInfo?.pageNumber || 1,
            pagePosition: result.pageInfo?.position || 0,
            // Enhanced metadata for better reference accuracy
            positionType: result.pageInfo?.positionType || 'fallback',
            confidence: result.pageInfo?.confidence || 0.5,
            contextBefore: result.pageInfo?.contextBefore || '',
            contextAfter: result.pageInfo?.contextAfter || '',
            chunkIndex: result.pageInfo?.chunkIndex || result.index,
            matchStartChar: result.pageInfo?.matchStartChar || 0,
            matchEndChar: result.pageInfo?.matchEndChar || result.chunk.length
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
                    processingStatus: 'failed',
                    summary: 'Processing failed. Please try again.'
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
                await processAndRespondToMessage(message);
            } catch (error) {
                console.error(`❌ [${conversationId}] Error processing pending message ${message.id}:`, error);
                // Mark message as error
                await prisma.message.update({
                    where: { id: message.id },
                    data: { status: 'error', error: error.message }
                });
            }
        }
    } catch (error) {
        console.error(`❌ [${conversationId}] Error processing pending messages:`, error);
    }
}

// Enhanced function to map text chunks to page numbers and positions with improved accuracy
function mapChunksToPages(chunks, fullText, pageInfo) {
    console.log(`🗺️  [PageMapping] Starting enhanced mapping for ${chunks.length} chunks across ${pageInfo.length} pages`);
    console.log(`🗺️  [PageMapping] Full text length: ${fullText.length} characters`);
    console.log(`🗺️  [PageMapping] Page info available:`, pageInfo.length > 0);
    
    // Debug: Check if pageInfo is properly structured
    if (pageInfo.length === 0) {
        console.error(`❌ [PageMapping] CRITICAL: No page info available! All chunks will default to page 1`);
        console.error(`❌ [PageMapping] This suggests PDF parsing failed or global.pdfPageInfo was cleared`);
    }
    
    const chunksWithPageInfo = [];
    const pageTexts = [];
    let cumulativePageLengths = [0]; // Track cumulative text lengths for each page
    
    // Pre-process page texts and calculate cumulative lengths
    for (let pageIndex = 0; pageIndex < pageInfo.length; pageIndex++) {
        const pageText = pageInfo[pageIndex]?.textItems?.map(item => item.text).join('') || '';
        pageTexts.push(pageText);
        const prevLength = cumulativePageLengths[cumulativePageLengths.length - 1];
        cumulativePageLengths.push(prevLength + pageText.length);
        
        console.log(`📄 [PageMapping] Page ${pageIndex + 1}: ${pageText.length} characters`);
    }
    
    console.log(`🗺️  [PageMapping] Page text lengths:`, pageTexts.map((text, i) => `Page ${i + 1}: ${text.length} chars`));
    console.log(`🗺️  [PageMapping] Cumulative lengths:`, cumulativePageLengths);
    
    // Debug: Check if page texts sum up to full text
    const totalPageTextLength = pageTexts.reduce((sum, text) => sum + text.length, 0);
    console.log(`🗺️  [PageMapping] Total page text length: ${totalPageTextLength}, Full text length: ${fullText.length}`);
    if (Math.abs(totalPageTextLength - fullText.length) > 100) {
        console.warn(`⚠️  [PageMapping] Text length mismatch detected! Difference: ${Math.abs(totalPageTextLength - fullText.length)} chars`);
    }
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkResult = findBestChunkMatch(chunk, fullText, pageTexts, cumulativePageLengths, i, chunks.length);
        
        // Validate the match
        const validatedResult = validateChunkMapping(chunk, chunkResult, pageTexts);
        
        chunksWithPageInfo.push({
            pageNumber: validatedResult.pageNumber,
            position: validatedResult.position,
            positionType: validatedResult.positionType, // 'exact', 'approximate', 'fallback'
            confidence: validatedResult.confidence, // 0-1 confidence score
            chunkText: chunk,
            chunkIndex: i,
            // Additional metadata for better reference linking
            contextBefore: validatedResult.contextBefore || '',
            contextAfter: validatedResult.contextAfter || '',
            matchStartChar: validatedResult.matchStartChar || 0,
            matchEndChar: validatedResult.matchEndChar || chunk.length
        });
        
        if (validatedResult.confidence < 0.7) {
            console.warn(`⚠️  [PageMapping] Low confidence mapping for chunk ${i}: ${validatedResult.confidence.toFixed(2)}`);
        }
    }
    
    // Log mapping statistics
    const confidenceStats = chunksWithPageInfo.reduce((acc, chunk) => {
        const level = chunk.confidence >= 0.9 ? 'high' : chunk.confidence >= 0.7 ? 'medium' : 'low';
        acc[level]++;
        return acc;
    }, { high: 0, medium: 0, low: 0 });
    
    console.log(`🗺️  [PageMapping] Confidence distribution:`, confidenceStats);
    
    return chunksWithPageInfo;
}

// Enhanced function to find the best match for a chunk with multiple strategies
function findBestChunkMatch(chunk, fullText, pageTexts, cumulativePageLengths, chunkIndex, totalChunks) {
    console.log(`🔍 [ChunkMatch] Processing chunk ${chunkIndex}: "${chunk.substring(0, 50)}..."`);
    
    // Strategy 1: Exact substring match with context
    const exactMatch = findExactMatch(chunk, fullText, pageTexts, cumulativePageLengths);
    if (exactMatch.confidence > 0.9) {
        console.log(`✅ [ChunkMatch] Exact match found for chunk ${chunkIndex}`);
        return exactMatch;
    }
    
    // Strategy 2: Fuzzy matching for chunks that might have been processed differently
    const fuzzyMatch = findFuzzyMatch(chunk, pageTexts, cumulativePageLengths);
    if (fuzzyMatch.confidence > exactMatch.confidence) {
        console.log(`🔍 [ChunkMatch] Fuzzy match better than exact for chunk ${chunkIndex}`);
        return fuzzyMatch;
    }
    
    // Strategy 3: Position-based estimation (improved fallback)
    if (pageTexts.length > 0) {
        const positionEstimate = estimatePositionByOrder(chunk, chunkIndex, pageTexts, cumulativePageLengths, totalChunks);
        console.log(`📊 [ChunkMatch] Using position estimation for chunk ${chunkIndex}: page ${positionEstimate.pageNumber}`);
        return positionEstimate;
    }
    
    // Last resort: If no page info at all, estimate based on total chunks
    console.error(`❌ [ChunkMatch] No page info available, using desperate fallback for chunk ${chunkIndex}`);
    return {
        pageNumber: 1, // Only default to 1 as absolute last resort
        position: 0,
        confidence: 0.1,
        positionType: 'desperate_fallback',
        contextBefore: '',
        contextAfter: ''
    };
}

// Find exact substring match
function findExactMatch(chunk, fullText, pageTexts, cumulativePageLengths) {
    const chunkStart = fullText.indexOf(chunk);
    
    if (chunkStart === -1) {
        console.warn(`⚠️  [ExactMatch] Chunk not found in full text: "${chunk.substring(0, 50)}..."`);
        // Instead of defaulting to page 1, return null to try other strategies
        return { pageNumber: -1, position: 0, confidence: 0, positionType: 'not_found' };
    }
    
    // Find which page contains this position
    for (let pageIndex = 0; pageIndex < pageTexts.length; pageIndex++) {
        const pageStart = cumulativePageLengths[pageIndex];
        const pageEnd = cumulativePageLengths[pageIndex + 1];
        
        if (chunkStart >= pageStart && chunkStart < pageEnd) {
            const positionInPage = chunkStart - pageStart;
            
            console.log(`✅ [ExactMatch] Found chunk at page ${pageIndex + 1}, position ${positionInPage}`);
            
            // Extract context for validation
            const contextStart = Math.max(0, chunkStart - 50);
            const contextEnd = Math.min(fullText.length, chunkStart + chunk.length + 50);
            const contextBefore = fullText.substring(contextStart, chunkStart);
            const contextAfter = fullText.substring(chunkStart + chunk.length, contextEnd);
            
            return {
                pageNumber: pageIndex + 1,
                position: positionInPage,
                confidence: 0.95,
                positionType: 'exact',
                contextBefore,
                contextAfter,
                matchStartChar: chunkStart,
                matchEndChar: chunkStart + chunk.length
            };
        }
    }
    
    console.warn(`⚠️  [ExactMatch] Chunk found in text but not in any page boundaries. ChunkStart: ${chunkStart}`);
    return { pageNumber: -1, position: 0, confidence: 0.1, positionType: 'boundary_error' };
}

// Find fuzzy match using similarity comparison
function findFuzzyMatch(chunk, pageTexts, cumulativePageLengths) {
    let bestMatch = { pageNumber: 1, position: 0, confidence: 0, positionType: 'approximate' };
    
    // Clean chunk text for better matching
    const cleanChunk = chunk.replace(/\s+/g, ' ').trim().toLowerCase();
    const chunkWords = cleanChunk.split(' ').filter(word => word.length > 2);
    
    if (chunkWords.length === 0) {
        return bestMatch;
    }
    
    for (let pageIndex = 0; pageIndex < pageTexts.length; pageIndex++) {
        const pageText = pageTexts[pageIndex].replace(/\s+/g, ' ').trim().toLowerCase();
        
        // Calculate word overlap
        const pageWords = pageText.split(' ');
        const matchingWords = chunkWords.filter(word => pageText.includes(word));
        const wordOverlapScore = matchingWords.length / chunkWords.length;
        
        if (wordOverlapScore > bestMatch.confidence) {
            // Find approximate position of first matching word
            const firstMatchWord = matchingWords[0];
            const wordPosition = pageText.indexOf(firstMatchWord);
            
            bestMatch = {
                pageNumber: pageIndex + 1,
                position: Math.max(0, wordPosition),
                confidence: wordOverlapScore * 0.8, // Reduce confidence for fuzzy matches
                positionType: 'approximate',
                contextBefore: pageText.substring(Math.max(0, wordPosition - 50), wordPosition),
                contextAfter: pageText.substring(wordPosition, Math.min(pageText.length, wordPosition + 100))
            };
        }
    }
    
    return bestMatch;
}

// Estimate position based on chunk order
function estimatePositionByOrder(chunk, chunkIndex, pageTexts, cumulativePageLengths, totalChunks) {
    console.log(`📊 [PositionEstimate] Estimating position for chunk ${chunkIndex}`);
    
    if (pageTexts.length === 0) {
        console.error(`❌ [PositionEstimate] No page texts available`);
        return {
            pageNumber: 1,
            position: 0,
            confidence: 0.1,
            positionType: 'no_pages_fallback',
            contextBefore: '',
            contextAfter: ''
        };
    }
    
    const totalTextLength = cumulativePageLengths[cumulativePageLengths.length - 1];
    
    // Estimate position based on chunk index ratio
    const chunkRatio = chunkIndex / (totalChunks || 100); // Use totalChunks if available
    const estimatedPosition = chunkRatio * totalTextLength;
    
    console.log(`📊 [PositionEstimate] Chunk ${chunkIndex}, ratio: ${chunkRatio.toFixed(3)}, estimated position: ${estimatedPosition.toFixed(0)}`);
    
    // Find which page this estimated position falls into
    for (let pageIndex = 0; pageIndex < pageTexts.length; pageIndex++) {
        const pageStart = cumulativePageLengths[pageIndex];
        const pageEnd = cumulativePageLengths[pageIndex + 1];
        
        if (estimatedPosition >= pageStart && estimatedPosition < pageEnd) {
            const pageNumber = pageIndex + 1;
            const positionInPage = estimatedPosition - pageStart;
            
            console.log(`📊 [PositionEstimate] Chunk ${chunkIndex} estimated to page ${pageNumber}, position ${positionInPage.toFixed(0)}`);
            
            return {
                pageNumber,
                position: Math.max(0, positionInPage),
                confidence: 0.5,
                positionType: 'position_estimate',
                contextBefore: '',
                contextAfter: ''
            };
        }
    }
    
    // If estimation fails, distribute evenly across pages
    const estimatedPageIndex = Math.floor((chunkIndex / (totalChunks || 100)) * pageTexts.length);
    const safePageIndex = Math.min(estimatedPageIndex, pageTexts.length - 1);
    const pageNumber = safePageIndex + 1;
    
    console.log(`📊 [PositionEstimate] Using page distribution: chunk ${chunkIndex} -> page ${pageNumber}`);
    
    return {
        pageNumber,
        position: 0,
        confidence: 0.3,
        positionType: 'page_distribution',
        contextBefore: '',
        contextAfter: ''
    };
}

// Validate chunk mapping and adjust if necessary
function validateChunkMapping(chunk, mapping, pageTexts) {
    console.log(`🔍 [Validation] Validating chunk mapping: page ${mapping.pageNumber}, confidence ${mapping.confidence}, type ${mapping.positionType}`);
    
    if (mapping.positionType === 'exact' && mapping.confidence > 0.9) {
        console.log(`✅ [Validation] High confidence exact match approved`);
        return mapping; // High confidence exact matches don't need validation
    }
    
    // Don't validate if we have no page information
    if (!pageTexts || pageTexts.length === 0) {
        console.warn(`⚠️  [Validation] No page texts available for validation, keeping original mapping`);
        return {
            ...mapping,
            confidence: Math.min(0.3, mapping.confidence),
            positionType: 'unvalidated'
        };
    }
    
    // Handle special error cases from findExactMatch
    if (mapping.pageNumber === -1) {
        console.warn(`⚠️  [Validation] Negative page number detected, attempting recovery`);
        // Try to find a reasonable page based on chunk characteristics
        const recoveredPage = recoverPageFromChunk(chunk, pageTexts);
        return {
            ...mapping,
            pageNumber: recoveredPage,
            confidence: 0.4,
            positionType: 'recovered'
        };
    }
    
    const pageIndex = mapping.pageNumber - 1;
    if (pageIndex < 0 || pageIndex >= pageTexts.length) {
        console.warn(`⚠️  [Validation] Invalid page number ${mapping.pageNumber} (range: 1-${pageTexts.length})`);
        
        // Instead of defaulting to page 1, try to find a reasonable page
        if (mapping.pageNumber > pageTexts.length) {
            // If page number too high, use last page
            const lastPage = pageTexts.length;
            console.log(`📄 [Validation] Using last page ${lastPage} instead of ${mapping.pageNumber}`);
            return { 
                ...mapping, 
                pageNumber: lastPage, 
                position: 0, 
                confidence: Math.min(0.4, mapping.confidence),
                positionType: 'adjusted_to_last'
            };
        } else {
            // Only default to page 1 if page number is less than 1
            console.log(`📄 [Validation] Using page 1 as last resort`);
            return { 
                ...mapping, 
                pageNumber: 1, 
                position: 0, 
                confidence: Math.min(0.3, mapping.confidence),
                positionType: 'forced_to_first'
            };
        }
    }
    
    const pageText = pageTexts[pageIndex];
    
    // For fuzzy matches, try to improve the position
    if (mapping.positionType === 'approximate') {
        const cleanChunk = chunk.substring(0, 100).replace(/\s+/g, ' ').trim().toLowerCase();
        const cleanPageText = pageText.replace(/\s+/g, ' ').trim().toLowerCase();
        
        const betterPosition = cleanPageText.indexOf(cleanChunk);
        if (betterPosition !== -1) {
            console.log(`✅ [Validation] Improved approximate position from ${mapping.position} to ${betterPosition}`);
            return {
                ...mapping,
                position: betterPosition,
                confidence: Math.min(0.9, mapping.confidence + 0.1),
                positionType: 'validated'
            };
        }
    }
    
    // Ensure position is within page bounds
    if (mapping.position > pageText.length) {
        const adjustedPosition = Math.max(0, pageText.length - 100);
        console.log(`📍 [Validation] Adjusted position from ${mapping.position} to ${adjustedPosition} (page length: ${pageText.length})`);
        return {
            ...mapping,
            position: adjustedPosition,
            confidence: Math.min(0.5, mapping.confidence)
        };
    }
    
    console.log(`✅ [Validation] Mapping validated successfully`);
    return mapping;
}

// Helper function to recover page number from chunk content
function recoverPageFromChunk(chunk, pageTexts) {
    console.log(`🔄 [Recovery] Attempting to recover page for chunk: "${chunk.substring(0, 50)}..."`);
    
    const cleanChunk = chunk.replace(/\s+/g, ' ').trim().toLowerCase();
    const chunkWords = cleanChunk.split(' ').filter(word => word.length > 3);
    
    let bestPage = 1;
    let bestScore = 0;
    
    for (let pageIndex = 0; pageIndex < pageTexts.length; pageIndex++) {
        const pageText = pageTexts[pageIndex].replace(/\s+/g, ' ').trim().toLowerCase();
        
        // Count word matches
        const matches = chunkWords.filter(word => pageText.includes(word)).length;
        const score = matches / chunkWords.length;
        
        if (score > bestScore) {
            bestScore = score;
            bestPage = pageIndex + 1;
        }
    }
    
    console.log(`🔄 [Recovery] Best page found: ${bestPage} with score ${bestScore.toFixed(3)}`);
    return bestPage;
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
