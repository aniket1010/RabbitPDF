const { Queue } = require('bullmq');

// Parse Redis URL to handle password authentication
function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const redisPassword = process.env.REDIS_PASSWORD;
  
  try {
    // If URL contains password or REDIS_PASSWORD is set, parse URL
    if (redisUrl.includes('@') || redisPassword) {
      const url = new URL(redisUrl);
      const connection = {
        host: url.hostname || 'redis',
        port: parseInt(url.port) || 6379,
      };
      
      // Add password if present in URL or env var
      if (url.password) {
        connection.password = url.password;
      } else if (redisPassword) {
        connection.password = redisPassword;
      }
      
      // Add database number if specified
      if (url.pathname && url.pathname.length > 1) {
        connection.db = parseInt(url.pathname.slice(1));
      }
      
      return connection;
    }
    
    // Simple connection for local development (no password)
    return {
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    };
  } catch (error) {
    console.warn('⚠️ [Redis] Error parsing REDIS_URL, using defaults:', error.message);
    // Fallback to simple connection
    return {
      host: 'redis',
      port: 6379,
      password: redisPassword || undefined,
    };
  }
}

const connection = {
  connection: getRedisConnection(),
};

const pdfProcessingQueue = new Queue('pdf-processing', connection);

module.exports = { pdfProcessingQueue, connection };




