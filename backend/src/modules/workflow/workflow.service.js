// src/modules/workflow/workflow.service.js
const prisma = require('../../config/db');
const { parsePagination, buildPaginationMeta } = require('../../utils/helpers');

/**
 * Create a workflow with its steps in a transaction
 * Using a Prisma transaction ensures both the workflow and its steps
 * are created atomically — if steps fail, the workflow is rolled back.
 */
const createWorkflow = async (userId, { name, triggerType, isActive, steps }) => {
  return prisma.$transaction(async (tx) => {
    const workflow = await tx.workflow.create({
      data: {
        userId,
        name,
        triggerType,
        isActive,
        steps: {
          create: steps.map((s) => ({
            stepOrder: s.stepOrder,
            actionType: s.actionType,
            config: s.config,
          })),
        },
      },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    return workflow;
  });
};

/**
 * Get all workflows for a user with pagination
 */
const getWorkflows = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);

  const [workflows, total] = await Promise.all([
    prisma.workflow.findMany({
      where: { userId },
      include: { steps: { orderBy: { stepOrder: 'asc' } }, _count: { select: { executions: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.workflow.count({ where: { userId } }),
  ]);

  return { workflows, meta: buildPaginationMeta(total, page, limit) };
};

/**
 * Get a single workflow — validates ownership
 */
const getWorkflowById = async (userId, workflowId) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  });

  if (!workflow) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }
  return workflow;
};

/**
 * Update a workflow and optionally replace all its steps
 */
const updateWorkflow = async (userId, workflowId, { name, triggerType, isActive, steps }) => {
  // Verify ownership first
  await getWorkflowById(userId, workflowId);

  return prisma.$transaction(async (tx) => {
    // If steps provided, delete existing and recreate
    if (steps) {
      await tx.workflowStep.deleteMany({ where: { workflowId } });
    }

    return tx.workflow.update({
      where: { id: workflowId },
      data: {
        ...(name && { name }),
        ...(triggerType && { triggerType }),
        ...(isActive !== undefined && { isActive }),
        ...(steps && {
          steps: {
            create: steps.map((s) => ({
              stepOrder: s.stepOrder,
              actionType: s.actionType,
              config: s.config,
            })),
          },
        }),
      },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
  });
};

/**
 * Delete a workflow (cascades to steps & executions via Prisma schema)
 */
const deleteWorkflow = async (userId, workflowId) => {
  await getWorkflowById(userId, workflowId);
  await prisma.workflow.delete({ where: { id: workflowId } });
  return { deleted: true };
};

/**
 * Find active workflows by trigger type — used by the event system
 */
const findWorkflowsByTrigger = async (triggerType) => {
  return prisma.workflow.findMany({
    where: { triggerType, isActive: true },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  });
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  findWorkflowsByTrigger,
};
