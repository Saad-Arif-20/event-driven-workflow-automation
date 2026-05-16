// src/modules/user/user.service.js
const prisma = require('../../config/db');

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      _count: { select: { workflows: true } },
    },
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const { getQueueStats } = require('../../services/queueService');

const getDashboardStats = async (userId) => {
  const workflows = await prisma.workflow.findMany({
    where: { userId },
    select: { id: true, triggerType: true, isActive: true }
  });
  
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.isActive).length;
  const triggers = [...new Set(workflows.map(w => w.triggerType))].length;
  
  const workflowIds = workflows.map(w => w.id);
  
  const statusCounts = workflowIds.length > 0 ? await prisma.execution.groupBy({
    by: ['status'],
    where: { workflowId: { in: workflowIds } },
    _count: true
  }) : [];
  
  let totalExecs = 0;
  let successfulExecs = 0;
  let failedExecs = 0;
  statusCounts.forEach(sc => {
    totalExecs += sc._count;
    if (sc.status === 'SUCCESS') successfulExecs += sc._count;
    if (sc.status === 'FAILED') failedExecs += sc._count;
  });
  
  const successRate = totalExecs > 0 ? Math.round((successfulExecs / totalExecs) * 100) : 0;
  
  const queue = await getQueueStats();
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentExecs = workflowIds.length > 0 ? await prisma.execution.findMany({
    where: { 
      workflowId: { in: workflowIds },
      startedAt: { gte: sevenDaysAgo }
    },
    select: { startedAt: true }
  }) : [];
  
  const dailyCounts = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date().setHours(0,0,0,0);
  recentExecs.forEach(e => {
    const d = new Date(e.startedAt).setHours(0,0,0,0);
    const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      dailyCounts[6 - diffDays]++;
    }
  });

  return {
    totalWorkflows,
    activeWorkflows,
    triggers,
    totalExecs,
    failedExecs,
    successRate,
    queue,
    dailyActivity: dailyCounts
  };
};

module.exports = { getProfile, getDashboardStats };
