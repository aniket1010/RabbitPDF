require('dotenv').config();
const { Worker, QueueEvents } = require('bullmq');
const { processPdf } = require('../services/pdfProcessor');

// Parse Redis connection directly here to avoid any import issues
function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  const redisPassword = process.env.REDIS_PASSWORD;
  
  console.log('🔧 [Worker Redis] REDIS_URL:', redisUrl ? redisUrl.replace(/:[^:@]+@/, ':***@') : '[NOT SET]');
  
  try {
    if (redisUrl && redisUrl.includes('@')) {
      const url = new URL(redisUrl);
      return {
        host: url.hostname || 'redis',
        port: parseInt(url.port) || 6379,
        password: url.password || redisPassword || undefined,
      };
    }
    
    return {
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: redisPassword || undefined,
    };
  } catch (error) {
    console.warn('⚠️ [Worker Redis] Error parsing URL:', error.message);
    return {
      host: 'redis',
      port: 6379,
      password: redisPassword || undefined,
    };
  }
}

const redisConnection = getRedisConnection();
console.log('🔧 [Worker] Redis connection config:', { 
  host: redisConnection.host, 
  port: redisConnection.port, 
  hasPassword: !!redisConnection.password 
});

const worker = new Worker(
  'pdf-processing',
  async (job) => {
    const { filePath, conversationId, originalName } = job.data;
    await processPdf({ filePath, conversationId, originalName });
  },
  { connection: redisConnection }
);

const queueEvents = new QueueEvents('pdf-processing', { connection: redisConnection });
queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ [Worker] Job ${jobId} failed:`, failedReason);
});

queueEvents.on('completed', ({ jobId }) => {
  console.log(`✅ [Worker] Job ${jobId} completed`);
});

worker.on('error', (err) => {
  console.error('❌ [Worker] Error:', err);
});

worker.on('ready', () => {
  console.log('✅ [Worker] Connected to Redis and ready to process jobs');
});

console.log('📥 [Worker] PDF processing worker started');




