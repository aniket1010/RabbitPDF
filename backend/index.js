require('dotenv').config();

const express = require('express');
const { allowedOrigins } = require('./config/cors');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { validatePDF } = require('./middleware/validation');
const { initializeWebSocket } = require('./websocket');

const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversation');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow mobile apps / Postman
    if (allowedOrigins.includes(origin.toLowerCase())) return cb(null, true);
    return cb(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(cookieParser()); // Parse cookies for NextAuth JWT tokens
app.use(express.json());

// Routes
app.use('/upload', uploadRoutes);
app.use('/chat', chatRoutes);
app.use('/conversation', conversationRoutes);
app.use('/user', userRoutes);

// Create HTTP server and integrate WebSocket
const server = createServer(app);
const io = initializeWebSocket(server);

// Health check endpoint (after WebSocket init)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    websocket: !!io,
    allowedOrigins: require('./config/cors').allowedOrigins
  });
});

// Make WebSocket available to routes
app.set('socketio', io);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server initialized on ws://${HOST}:${PORT}`);
  console.log(`🌐 Allowed origins:`, allowedOrigins);
  console.log(`🔍 Health check available at: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});
