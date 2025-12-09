const { Queue } = require('bullmq');

// Parse Redis URL to handle password authentication
function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  const redisPassword = process.env.REDIS_PASSWORD;
  
  console.log('🔧 [Redis] Configuring connection...');
  console.log('🔧 [Redis] REDIS_URL:', redisUrl ? '[SET]' : '[NOT SET]');
  console.log('🔧 [Redis] REDIS_PASSWORD:', redisPassword ? '[SET]' : '[NOT SET]');
  
  try {
    // If REDIS_URL is set and contains auth info, parse it
    if (redisUrl && redisUrl.includes('@')) {
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
      
      console.log('🔧 [Redis] Parsed connection:', { host: connection.host, port: connection.port, hasPassword: !!connection.password });
      return connection;
    }
    
    // Use REDIS_PASSWORD if set, connect to 'redis' host (Docker service name)
    const connection = {
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    };
    
    if (redisPassword) {
      connection.password = redisPassword;
    }
    
    console.log('🔧 [Redis] Simple connection:', { host: connection.host, port: connection.port, hasPassword: !!connection.password });
    return connection;
  } catch (error) {
    console.warn('⚠️ [Redis] Error parsing REDIS_URL, using defaults:', error.message);
    // Fallback to simple connection
    const connection = {
      host: 'redis',
      port: 6379,
    };
    if (redisPassword) {
      connection.password = redisPassword;
    }
    console.log('🔧 [Redis] Fallback connection:', { host: connection.host, port: connection.port, hasPassword: !!connection.password });
    return connection;
  }
}

const connection = {
  connection: getRedisConnection(),
};

const pdfProcessingQueue = new Queue('pdf-processing', connection);

module.exports = { pdfProcessingQueue, connection };




