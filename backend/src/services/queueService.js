// src/services/queueService.js
// BullMQ Queue Service — manages the workflow job queue
//
// WHY BullMQ?
// When an event arrives, we don't execute workflows synchronously in the
// HTTP request. That would make the API slow and non-resilient.
// Instead, we push a job to BullMQ (backed by Redis), respond immediately
// with 202 Accepted, and let a separate worker process the job asynchronously.
//
// Benefits:
//   - API response times stay fast regardless of workflow complexity
//   - Jobs survive server restarts (Redis persistence)
//   - Built-in retry logic on failure
//   - Job visibility and monitoring via BullMQ dashboard

const { Queue } = require('bullmq');
const env = require('../config/env');
const logger = require('../utils/logger');

const QUEUE_NAME = 'workflow-executions';

// Redis connection config for BullMQ
// maxRetriesPerRequest: null is REQUIRED by BullMQ
const connection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
  maxRetriesPerRequest: null,
};

// Create the queue instance (shared by API server)
const workflowQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,                  // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',        // 2s, 4s, 8s between retries
      delay: 2000,
    },
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs in Redis
    removeOnFail: { count: 200 },     // Keep last 200 failed jobs for debugging
  },
});

workflowQueue.on('error', (err) => {
  logger.error(`Queue error: ${err.message}`);
});

/**
 * Add a workflow execution job to the queue
 *
 * @param {object} jobData - { workflowId, eventId, eventType, eventPayload, steps }
 * @returns {Promise<Job>} - The BullMQ Job object
 */
const addWorkflowJob = async (jobData) => {
  const job = await workflowQueue.add('execute-workflow', jobData, {
    jobId: `${jobData.workflowId}-${jobData.eventId}-${Date.now()}`,
  });

  logger.info(
    `Job ${job.id} queued | workflow: ${jobData.workflowId} | event: ${jobData.eventId}`
  );

  return job;
};

/**
 * Get queue stats — useful for debugging/monitoring
 */
const getQueueStats = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    workflowQueue.getWaitingCount(),
    workflowQueue.getActiveCount(),
    workflowQueue.getCompletedCount(),
    workflowQueue.getFailedCount(),
  ]);
  return { waiting, active, completed, failed };
};

module.exports = { workflowQueue, addWorkflowJob, getQueueStats, QUEUE_NAME, connection };
