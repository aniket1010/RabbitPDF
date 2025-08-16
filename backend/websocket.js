// WebSocket utility functions and event handlers

const { verifyWebSocketAuth } = require('./utils/auth');

// Global IO instance - will be set when WebSocket is initialized
let globalIO = null;

// Setup WebSocket authentication and event handlers
function setupWebSocket(io) {
  // Store the IO instance globally for MessageEvents to use
  globalIO = io;
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      console.log('🔌 [WebSocket] Connection attempt from:', socket.handshake.address);
      
      const authResult = await verifyWebSocketAuth(socket);
      
      if (authResult.authenticated) {
        socket.userId = authResult.userId;
        socket.userEmail = authResult.userEmail;
        socket.userName = authResult.userName;
        next();
      } else {
        if (process.env.NODE_ENV !== 'production') {
          socket.userId = 'dev-user';
          socket.userEmail = 'dev@example.com';
          socket.userName = 'Developer';
          next();
        } else {
          next(new Error('Authentication failed'));
        }
      }
    } catch (error) {
      console.error('❌ [WebSocket] Auth error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ [WebSocket] Client connected: ${socket.id}`);

    // Join user room
    const userRoom = `user_${socket.userId}`;
    socket.join(userRoom);

    // Handle events
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`🔗 [WebSocket] User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`🔗 [WebSocket] User ${socket.userId} left conversation ${conversationId}`);
    });

    socket.on('typing', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ [WebSocket] Client disconnected: ${socket.id} - ${reason}`);
    });
  });
}

// Message Events - Simple and robust WebSocket message emitters
const MessageEvents = {
  MESSAGE_PROCESSING_STARTED: (conversationId, messageId) => {
    if (globalIO) {
      console.log(`📡 [WebSocket] Emitting message-processing-started for message ${messageId}`);
      globalIO.to(`conversation_${conversationId}`).emit('message-processing-started', {
        messageId,
        status: 'processing'
      });
    }
  },

  AI_THINKING: (conversationId, messageId) => {
    if (globalIO) {
      console.log(`📡 [WebSocket] Emitting ai-thinking for message ${messageId}`);
      globalIO.to(`conversation_${conversationId}`).emit('ai-thinking', {
        messageId,
        status: 'thinking'
      });
    }
  },

  AI_RESPONSE_COMPLETE: (conversationId, messageId, assistantMessage) => {
    if (globalIO) {
      console.log(`📡 [WebSocket] Emitting ai-response-complete for message ${messageId}`);
      globalIO.to(`conversation_${conversationId}`).emit('ai-response-complete', {
        messageId,
        assistantMessage: {
          id: assistantMessage.id,
          text: assistantMessage.formattedText || assistantMessage.text,
          originalText: assistantMessage.text,
          contentType: assistantMessage.contentType || 'text',
          isUser: false,
          timestamp: assistantMessage.createdAt,
          processedAt: assistantMessage.processedAt,
          status: assistantMessage.status,
          error: assistantMessage.error
        }
      });
    }
  },

  MESSAGE_ERROR: (conversationId, messageId, error) => {
    if (globalIO) {
      console.log(`📡 [WebSocket] Emitting message-error for message ${messageId}`);
      globalIO.to(`conversation_${conversationId}`).emit('message-error', {
        messageId,
        error: error.message || 'An error occurred'
      });
    }
  },

  PDF_PROCESSING_COMPLETE: (conversationId) => {
    if (globalIO) {
      console.log(`📡 [WebSocket] Emitting pdf-processing-complete for conversation ${conversationId}`);
      globalIO.to(`conversation_${conversationId}`).emit('pdf-processing-complete', {
        status: 'completed'
      });
    }
  }
};

// Emit events to specific rooms
function emitToUser(io, userId, event, data) {
  io.to(`user_${userId}`).emit(event, data);
}

function emitToConversation(io, conversationId, event, data) {
  io.to(`conversation_${conversationId}`).emit(event, data);
}

module.exports = {
  setupWebSocket,
  emitToUser,
  emitToConversation,
  MessageEvents
};
