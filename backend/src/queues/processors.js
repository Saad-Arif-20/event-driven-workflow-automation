// src/queues/processors.js
// Job processor — defines what happens when a job is dequeued by the worker.
// This is the bridge between BullMQ and the WorkflowEngine.

const { runWorkflow } = require('../services/workflowEngine');
const logger = require('../utils/logger');

/**
 * Processes a single "execute-workflow" job.
 *
 * BullMQ calls this function for each job pulled from the queue.
 * It receives the full job object, extracts data, and delegates to the engine.
 *
 * If this function throws, BullMQ automatically retries based on job options.
 */
const processWorkflowJob = async (job) => {
  const { workflowId, eventId, eventPayload, steps } = job.data;

  logger.info(
    `[Processor] Processing job ${job.id} | workflow: ${workflowId} | attempt: ${job.attemptsMade + 1}`
  );

  // Update job progress so it's visible in BullMQ dashboard
  await job.updateProgress(10);

  try {
    const result = await runWorkflow({
      workflowId,
      eventId,
      eventPayload,
      steps,
    });

    await job.updateProgress(100);
    logger.info(
      `[Processor] Job ${job.id} completed | execution status: ${result.status}`
    );

    return { executionId: result.id, status: result.status };
  } catch (err) {
    logger.error(`[Processor] Job ${job.id} failed: ${err.message}`);
    // Re-throw so BullMQ marks job as failed and triggers retry
    throw err;
  }
};

module.exports = { processWorkflowJob };
