// WebSocket server for real-time communication
const { Server } = require('socket.io');
const { allowedOrigins } = require('./config/cors');
const { verifyAuthSocket } = require('./utils/auth');

let io;

function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin.toLowerCase())) {
          return callback(null, true);
        }
        
        console.log(`❌ [WebSocket] CORS blocked origin: ${origin}`);
        return callback(new Error('CORS not allowed'), false);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
    },
    allowEIO3: true,
    transports: ['polling', 'websocket'], // Start with polling first
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    allowUpgrades: true,
    serveClient: false, // Don't serve client files
    path: '/socket.io/'
  });

  // Add connection debugging
  io.engine.on("connection_error", (err) => {
    console.error('❌ [WebSocket Engine] Connection error:', {
      req: err.req ? `${err.req.method} ${err.req.url}` : 'no req',
      code: err.code,
      message: err.message,
      context: err.context
    });
  });

  // Use proper authentication to get real user ID
  io.use(async (socket, next) => {
    try {
      console.log(`🔌 [WebSocket] Connection attempt from: ${socket.handshake.address}`);
      console.log(`🔌 [WebSocket] Headers:`, socket.handshake.headers);
      
      const req = socket.request;
      const authResult = await verifyAuthSocket(req);
      
      if (authResult.authenticated) {
        socket.userId = authResult.userId;
        socket.userEmail = authResult.userEmail;
        console.log(`🔌 [WebSocket] User connected: ${authResult.userEmail} (${socket.id}) - User ID: ${authResult.userId}`);
        next();
      } else {
        console.log(`❌ [WebSocket] Authentication failed for socket ${socket.id}`);
        // For development, allow connection but use a fallback
        socket.userId = 'dev-user';
        socket.userEmail = 'dev@example.com';
        console.log(`✅ [WebSocket] Development fallback connection: ${socket.id}`);
        next();
      }
    } catch (error) {
      console.error('❌ [WebSocket] Auth error:', error);
      // For development, allow connection but use a fallback
      socket.userId = 'dev-user';
      socket.userEmail = 'dev@example.com';
      console.log(`✅ [WebSocket] Error fallback connection: ${socket.id}`);
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ [WebSocket] Client connected: ${socket.id} (User: ${socket.userEmail})`);

    // Join user-specific room for personal notifications
    socket.join(`user_${socket.userId}`);
    console.log(`🏠 [WebSocket] ${socket.userEmail} joined user room: user_${socket.userId}`);

    // Test connection handler
    socket.on('test-connection', (data) => {
      console.log(`🧪 [WebSocket] Test connection from ${socket.id}:`, data);
      socket.emit('test-response', { message: 'Backend received test', socketId: socket.id, userId: socket.userId });
    });

    // Join conversation room
    socket.on('join-conversation', (conversationId) => {
      // Verify user has access to this conversation
      socket.join(`conversation-${conversationId}`);
      console.log(`🏠 [WebSocket] ${socket.userEmail} joined conversation ${conversationId}`);
      
      // Send confirmation
      socket.emit('joined-conversation', { conversationId });
    });

    // Leave conversation room  
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation-${conversationId}`);
      console.log(`🚪 [WebSocket] ${socket.userEmail} left conversation ${conversationId}`);
    });

    // Handle user typing (optional feature)
    socket.on('user-typing', (data) => {
      socket.to(`conversation-${data.conversationId}`).emit('user-typing', {
        userId: socket.userId,
        userEmail: socket.userEmail
      });
    });

    socket.on('user-stopped-typing', (data) => {
      socket.to(`conversation-${data.conversationId}`).emit('user-stopped-typing', {
        userId: socket.userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 [WebSocket] Client disconnected: ${socket.id} (User: ${socket.userEmail})`);
    });
  });

  return io;
}

// Event emitters for message processing
const emitToConversation = (conversationId, event, data) => {
  if (io) {
    io.to(`conversation-${conversationId}`).emit(event, data);
    console.log(`📡 [WebSocket] Emitted ${event} to conversation ${conversationId}:`, data);
  }
};

// Message processing events
const MessageEvents = {
  // When user message is created and processing starts
  MESSAGE_PROCESSING_STARTED: (conversationId, messageId) => {
    emitToConversation(conversationId, 'message-processing-started', { 
      messageId,
      status: 'processing',
      timestamp: new Date()
    });
  },

  // When AI is generating response
  AI_THINKING: (conversationId, messageId) => {
    emitToConversation(conversationId, 'ai-thinking', { 
      messageId,
      status: 'ai-processing',
      timestamp: new Date()
    });
  },

  // When AI response is complete
  AI_RESPONSE_COMPLETE: (conversationId, messageId, assistantMessage) => {
    emitToConversation(conversationId, 'ai-response-complete', { 
      messageId,
      assistantMessage: {
        id: assistantMessage.id,
        text: assistantMessage.formattedText || assistantMessage.text,
        originalText: assistantMessage.text,
        contentType: assistantMessage.contentType,
        isUser: false,
        timestamp: assistantMessage.createdAt,
        processedAt: assistantMessage.processedAt,
        status: assistantMessage.status
      },
      timestamp: new Date()
    });
  },

  // When there's an error
  MESSAGE_ERROR: (conversationId, messageId, error) => {
    emitToConversation(conversationId, 'message-error', { 
      messageId,
      error: error.message || error,
      status: 'error',
      timestamp: new Date()
    });
  },

  // Progress updates during PDF processing
  PDF_PROCESSING_PROGRESS: (conversationId, progress) => {
    emitToConversation(conversationId, 'pdf-processing-progress', {
      progress,
      timestamp: new Date()
    });
  },

  // When PDF processing completes
  PDF_PROCESSING_COMPLETE: (conversationId) => {
    emitToConversation(conversationId, 'pdf-processing-complete', {
      status: 'completed',
      timestamp: new Date()
    });
  }
};

module.exports = {
  initializeWebSocket,
  MessageEvents,
  emitToConversation
};