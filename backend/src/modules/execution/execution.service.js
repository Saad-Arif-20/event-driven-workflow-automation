// src/modules/execution/execution.service.js
const prisma = require('../../config/db');
const { parsePagination, buildPaginationMeta } = require('../../utils/helpers');

/**
 * Get all executions for a specific workflow (with ownership check)
 */
const getExecutionsByWorkflow = async (userId, workflowId, query) => {
  // Verify workflow belongs to user
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  });
  if (!workflow) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }

  const { page, limit, skip } = parsePagination(query);
  const [executions, total] = await Promise.all([
    prisma.execution.findMany({
      where: { workflowId },
      include: { logs: { orderBy: { timestamp: 'asc' } } },
      orderBy: { startedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.execution.count({ where: { workflowId } }),
  ]);

  return { executions, meta: buildPaginationMeta(total, page, limit) };
};

/**
 * Get a single execution by ID with all its logs
 */
const getExecutionById = async (userId, executionId) => {
  const execution = await prisma.execution.findFirst({
    where: {
      id: executionId,
      workflow: { userId }, // join-based ownership check
    },
    include: {
      logs: { orderBy: { timestamp: 'asc' } },
      workflow: { select: { id: true, name: true } },
    },
  });

  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }
  return execution;
};

module.exports = { getExecutionsByWorkflow, getExecutionById };
