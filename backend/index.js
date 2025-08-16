require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import route modules
const userRoutes = require('./routes/user');
const conversationRoutes = require('./routes/conversation');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');

// Import middleware
const corsConfig = require('./config/cors');
const { setupWebSocket } = require('./websocket');

const app = express();
const server = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: corsConfig,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  allowRequest: (req, callback) => {
    // Allow all requests in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    // In production, check origin
    const origin = req.headers.origin;
    const allowed = corsConfig.origin.includes(origin);
    callback(null, allowed);
  }
});

// Store io instance in app for access in routes
app.set('socketio', io);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors(corsConfig));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/user', userRoutes);
app.use('/conversation', conversationRoutes);
app.use('/chat', chatRoutes);
app.use('/upload', uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ChatPDF Backend API',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/user',
      '/conversation',
      '/chat',
      '/upload'
    ]
  });
});

// Initialize WebSocket with proper setup
setupWebSocket(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ [Server] Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server initialized on ws://${HOST}:${PORT}`);
  console.log('🌐 Allowed origins:', corsConfig.origin);
  console.log(`🔍 Health check available at: http://${HOST}:${PORT}/health`);
});

module.exports = { app, server, io };
