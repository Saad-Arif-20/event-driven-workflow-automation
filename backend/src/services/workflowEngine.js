// src/services/workflowEngine.js
// ─────────────────────────────────────────────────────────────────────────────
// THE HEART OF THE SYSTEM
//
// The WorkflowEngine is responsible for:
//   1. Creating an Execution record in the DB (status: RUNNING)
//   2. Iterating through workflow steps in ORDER
//   3. Calling the correct action handler for each step
//   4. Writing an ExecutionLog after every step (success OR failure)
//   5. Marking the Execution as SUCCESS or FAILED when done
//
// This is a sequential, step-by-step execution model.
// If any step fails, we log it and mark the execution FAILED.
// Future: support retry logic, parallel steps, conditional branching.
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../config/db');
const { executeAction } = require('./actionHandlers');
const logger = require('../utils/logger');

/**
 * Main entry point called by the queue worker for each job.
 *
 * @param {string} workflowId - The workflow to execute
 * @param {string} eventId    - The event that triggered this execution
 * @param {object} eventPayload - The event payload (passed to action handlers)
 * @param {Array}  steps      - Ordered array of WorkflowStep objects
 */
const runWorkflow = async ({ workflowId, eventId, eventPayload, steps }) => {
  // ── Step 1: Create the Execution record ──────────────────────────────────
  const execution = await prisma.execution.create({
    data: {
      workflowId,
      eventId,
      status: 'RUNNING',
    },
  });

  logger.info(
    `[Engine] Starting execution ${execution.id} for workflow ${workflowId}`
  );

  let overallStatus = 'SUCCESS';

  // ── Step 2: Execute steps sequentially ───────────────────────────────────
  for (const step of steps) {
    const stepStart = Date.now();
    logger.info(
      `[Engine] Running step ${step.stepOrder} | type: ${step.actionType}`
    );

    try {
      const result = await executeAction(
        step.actionType,
        step.config,
        eventPayload
      );

      const duration = Date.now() - stepStart;

      // Log step success
      await prisma.executionLog.create({
        data: {
          executionId: execution.id,
          stepOrder: step.stepOrder,
          status: 'success',
          message: `Step ${step.stepOrder} [${step.actionType}] completed in ${duration}ms. Result: ${JSON.stringify(result)}`,
        },
      });

      logger.info(
        `[Engine] Step ${step.stepOrder} SUCCESS (${duration}ms)`
      );
    } catch (err) {
      const duration = Date.now() - stepStart;
      overallStatus = 'FAILED';

      // Log step failure
      await prisma.executionLog.create({
        data: {
          executionId: execution.id,
          stepOrder: step.stepOrder,
          status: 'failed',
          message: `Step ${step.stepOrder} [${step.actionType}] FAILED after ${duration}ms. Error: ${err.message}`,
        },
      });

      logger.error(
        `[Engine] Step ${step.stepOrder} FAILED: ${err.message}`
      );

      // Stop execution on first failure (fail-fast strategy)
      // Future enhancement: allow configurable continue-on-error per step
      break;
    }
  }

  // ── Step 3: Finalize the Execution record ─────────────────────────────────
  const finished = await prisma.execution.update({
    where: { id: execution.id },
    data: {
      status: overallStatus,
      finishedAt: new Date(),
    },
  });

  logger.info(
    `[Engine] Execution ${execution.id} finished with status: ${overallStatus}`
  );

  return finished;
};

module.exports = { runWorkflow };
