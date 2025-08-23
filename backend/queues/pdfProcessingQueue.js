const { Queue } = require('bullmq');

const connection = {
  connection: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  },
};

const pdfProcessingQueue = new Queue('pdf-processing', connection);

module.exports = { pdfProcessingQueue, connection };




