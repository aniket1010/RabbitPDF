// Central CORS configuration so both Express and Socket.IO stay in sync

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:4000',
  'http://127.0.0.1:4000'
];

const corsConfig = {
  origin: process.env.NODE_ENV === 'development' ? true : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsConfig;
