require('dotenv').config();
const { Worker, QueueEvents } = require('bullmq');
const { connection } = require('../queues/pdfProcessingQueue');
const { processPdf } = require('../services/pdfProcessor');

const worker = new Worker(
  'pdf-processing',
  async (job) => {
    const { filePath, conversationId, originalName } = job.data;
    await processPdf({ filePath, conversationId, originalName });
  },
  connection
);

const queueEvents = new QueueEvents('pdf-processing', connection.connection);
queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ [Worker] Job ${jobId} failed:`, failedReason);
});

queueEvents.on('completed', ({ jobId }) => {
  console.log(`✅ [Worker] Job ${jobId} completed`);
});

worker.on('error', (err) => {
  console.error('❌ [Worker] Error:', err);
});

console.log('📥 [Worker] PDF processing worker started');




