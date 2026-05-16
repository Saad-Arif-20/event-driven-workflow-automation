// src/modules/event/event.service.js
// The Event service is the entry point for the entire automation system.
// When an event arrives, it:
//   1. Persists the event to PostgreSQL
//   2. Finds all active workflows matching the trigger type
//   3. Pushes a job to the BullMQ queue for each matching workflow

const prisma = require('../../config/db');
const { findWorkflowsByTrigger } = require('../workflow/workflow.service');
const queueService = require('../../services/queueService');
const logger = require('../../utils/logger');

const processEvent = async ({ type, payload }) => {
  // Step 1: Persist the incoming event
  const event = await prisma.event.create({
    data: { type, payload },
  });

  logger.info(`Event created: ${event.id} | type: ${type}`);

  // Step 2: Find all active workflows that match this trigger
  const matchingWorkflows = await findWorkflowsByTrigger(type);

  logger.info(
    `Found ${matchingWorkflows.length} workflow(s) matching trigger: "${type}"`
  );

  if (matchingWorkflows.length === 0) {
    return {
      event,
      jobsQueued: 0,
      message: 'No active workflows found for this trigger',
    };
  }

  // Step 3: Enqueue a job for each matching workflow
  const jobs = await Promise.all(
    matchingWorkflows.map((workflow) =>
      queueService.addWorkflowJob({
        workflowId: workflow.id,
        eventId: event.id,
        eventType: type,
        eventPayload: payload,
        steps: workflow.steps,
      })
    )
  );

  logger.info(`Queued ${jobs.length} job(s) for event: ${event.id}`);

  return {
    event,
    jobsQueued: jobs.length,
    workflowIds: matchingWorkflows.map((w) => w.id),
  };
};

const getEvents = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.event.count(),
  ]);

  return { events, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

module.exports = { processEvent, getEvents };
