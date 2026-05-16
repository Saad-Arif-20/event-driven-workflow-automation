// src/queues/worker.js
// ─────────────────────────────────────────────────────────────────────────────
// BullMQ WORKER — runs as a SEPARATE PROCESS from the API server
//
// Usage:
//   npm run worker  (or: node src/queues/worker.js)
//
// WHY A SEPARATE PROCESS?
//   The API server handles HTTP requests. The worker handles async jobs.
//   Decoupling them means:
//     - A crash in one doesn't kill the other
//     - Each can be scaled independently (e.g., multiple worker instances)
//     - CPU-heavy jobs don't block the event loop of the API
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const { Worker } = require('bullmq');
const { QUEUE_NAME, connection } = require('../services/queueService');
const { processWorkflowJob } = require('./processors');
const logger = require('../utils/logger');

logger.info('🚀 Workflow Worker starting...');

const worker = new Worker(QUEUE_NAME, processWorkflowJob, {
  connection,
  concurrency: 5, // Process up to 5 jobs simultaneously
  limiter: {
    max: 100,       // Max 100 jobs per
    duration: 60000, // 60 seconds (rate limiting per worker)
  },
});

// ── Event Handlers ─────────────────────────────────────────────────────────

worker.on('active', (job) => {
  logger.info(`[Worker] Job ${job.id} is now active`);
});

worker.on('completed', (job, returnValue) => {
  logger.info(
    `[Worker] ✅ Job ${job.id} completed | Result: ${JSON.stringify(returnValue)}`
  );
});

worker.on('failed', (job, err) => {
  logger.error(
    `[Worker] ❌ Job ${job?.id} failed | Attempts: ${job?.attemptsMade} | Error: ${err.message}`
  );
});

worker.on('error', (err) => {
  logger.error(`[Worker] Worker error: ${err.message}`);
});

worker.on('stalled', (jobId) => {
  logger.warn(`[Worker] Job ${jobId} stalled — will be retried`);
});

// ── Graceful Shutdown ──────────────────────────────────────────────────────
// On SIGTERM/SIGINT, stop accepting new jobs and wait for current ones to finish

const shutdown = async (signal) => {
  logger.info(`[Worker] ${signal} received — graceful shutdown...`);
  await worker.close();
  logger.info('[Worker] Worker closed. Goodbye.');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

logger.info(`✅ Worker listening on queue: "${QUEUE_NAME}" | concurrency: 5`);
