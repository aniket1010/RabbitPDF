const express = require('express');
const { getEmbedding } = require('../services/embedding');
const { queryEmbedding } = require('../services/pinecone');
const { askGpt } = require('../services/gpt');
const { processMessageContent, cleanTextContent, processAndRespondToMessage } = require('../services/messageProcessor');
const { verifyAuth } = require('../utils/auth');
const prisma = require('../prismaClient');

const router = express.Router();

// Get messages for a conversation
router.get('/:conversationId', verifyAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check if conversation exists and belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: req.userId // ← Security: Only user's conversations!
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    // Get messages for the conversation
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    // Transform messages to frontend format
    const formattedMessages = messages.map(message => ({
      id: message.id,
      text: message.formattedText || message.text,
      originalText: message.text,
      contentType: message.contentType || 'text',
      isUser: message.role === 'user',
      timestamp: message.createdAt,
      processedAt: message.processedAt,
      status: message.status,
      error: message.error || null
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Post a new message to a conversation
router.post('/:conversationId', verifyAuth, async (req, res) => {
  try {
    const { question } = req.body;
    const { conversationId } = req.params;

    console.log('Received question:', question);

    // Check if conversation exists and belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: req.userId // ← Security: Only user's conversations!
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    // Clean and process user message
    const cleanedQuestion = cleanTextContent(question);
    const processedUserMessage = await processMessageContent(cleanedQuestion, 'user');

    // Always create the user message
    const userMessage = await prisma.message.create({
      data: { 
        conversationId, 
        role: 'user', 
        text: cleanedQuestion,
        formattedText: processedUserMessage.formatted,
        contentType: processedUserMessage.contentType,
        status: conversation.processingStatus === 'completed' ? 'processing' : 'pending',
        processedAt: processedUserMessage.processedAt,
        error: null
      }
    });

    // If processing is not complete, return the user message immediately
    if (conversation.processingStatus !== 'completed') {
      return res.json({
        id: userMessage.id,
        text: processedUserMessage.formatted,
        originalText: cleanedQuestion,
        contentType: processedUserMessage.contentType,
        isUser: true,
        timestamp: userMessage.createdAt,
        processedAt: processedUserMessage.processedAt,
        status: 'pending',
        error: null
      });
    }

    // If processing is complete, process the message immediately
    const assistantMessage = await processAndRespondToMessage(userMessage);

    if (!assistantMessage) {
      // If there was an error, fetch the updated user message for error info
      const erroredUserMessage = await prisma.message.findUnique({ where: { id: userMessage.id } });
      return res.json({
        id: erroredUserMessage.id,
        text: erroredUserMessage.formattedText || erroredUserMessage.text,
        originalText: erroredUserMessage.text,
        contentType: erroredUserMessage.contentType,
        isUser: true,
        timestamp: erroredUserMessage.createdAt,
        processedAt: erroredUserMessage.processedAt,
        status: erroredUserMessage.status,
        error: erroredUserMessage.error
      });
    }

    // Return assistant message in frontend format
    res.json({
      id: assistantMessage.id,
      text: assistantMessage.formattedText || assistantMessage.text,
      originalText: assistantMessage.text,
      contentType: assistantMessage.contentType,
      isUser: false,
      timestamp: assistantMessage.createdAt,
      processedAt: assistantMessage.processedAt,
      status: assistantMessage.status,
      error: assistantMessage.error
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    // Create a user-friendly error message
    let errorMessage = "I'm having trouble processing your request right now. Please try again in a moment.";
    if (error.message.includes('PineconeConnectionError') || error.message.includes('Connect Timeout Error')) {
      errorMessage = "I'm having trouble connecting to the document database. Please try again in a few minutes.";
    }
    // Process error message
    const processedError = await processMessageContent(errorMessage, 'assistant');
    // Save error as assistant message
    const assistantMessage = await prisma.message.create({
      data: { 
        conversationId, 
        role: 'assistant', 
        text: errorMessage,
        formattedText: processedError.formatted,
        contentType: processedError.contentType,
        status: 'error',
        processedAt: processedError.processedAt,
        error: error.message
      }
    });
    return res.json({
      id: assistantMessage.id,
      text: processedError.formatted,
      originalText: errorMessage,
      contentType: processedError.contentType,
      isUser: false,
      timestamp: assistantMessage.createdAt,
      processedAt: processedError.processedAt,
      status: 'error',
      error: error.message
    });
  }
});

// Diagnostic endpoint to check reference availability
router.get('/:conversationId/debug-references', verifyAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { query } = req.query;

    // Check if conversation exists and belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: req.userId
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    const { getEmbedding } = require('../services/embedding');
    const { queryEmbedding } = require('../services/pinecone');

    const debugInfo = {
      conversationId,
      processingStatus: conversation.processingStatus,
      totalChunks: 0,
      sampleQuery: query || "What is this document about?",
      matches: [],
      issues: []
    };

    // Test with sample query
    try {
      console.log(`🔧 [Debug] Testing vector search for conversation ${conversationId}`);
      const questionEmbedding = await getEmbedding(debugInfo.sampleQuery);
      const matches = await queryEmbedding(questionEmbedding, 10, conversationId);
      
      debugInfo.totalChunks = matches.length;
      debugInfo.matches = matches.map((match, index) => ({
        index: index + 1,
        score: (match.score || 0).toFixed(3),
        pageNumber: match.metadata?.pageNumber || 'unknown',
        confidence: (match.metadata?.confidence || 0).toFixed(3),
        positionType: match.metadata?.positionType || 'unknown',
        hasText: !!(match.metadata?.text),
        textPreview: match.metadata?.text ? match.metadata.text.substring(0, 100) + '...' : 'No text'
      }));

      // Analyze issues
      if (matches.length === 0) {
        debugInfo.issues.push('No vector matches found - PDF may not be processed or indexed');
      }

      const validMatches = matches.filter(m => m.metadata?.text && m.metadata?.pageNumber);
      if (validMatches.length < matches.length) {
        debugInfo.issues.push(`${matches.length - validMatches.length} matches missing text or page number`);
      }

      const lowConfidenceMatches = matches.filter(m => (m.metadata?.confidence || m.score || 0) < 0.4);
      if (lowConfidenceMatches.length > 0) {
        debugInfo.issues.push(`${lowConfidenceMatches.length} matches below confidence threshold (0.4)`);
      }

      const page1Matches = matches.filter(m => m.metadata?.pageNumber === 1);
      if (page1Matches.length === matches.length && matches.length > 3) {
        debugInfo.issues.push('All matches point to page 1 - possible page mapping issue');
      }

    } catch (error) {
      debugInfo.issues.push(`Vector search failed: ${error.message}`);
    }

    res.json(debugInfo);

  } catch (error) {
    console.error('Error in debug references route:', error);
    res.status(500).json({ error: 'Error debugging references' });
  }
});

module.exports = router;
