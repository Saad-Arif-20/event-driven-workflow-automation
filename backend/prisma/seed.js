const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_USER_EMAIL = 'saad.arif498267@gmail.com';

const seed = async () => {
  console.log('🌱 Starting seed process...');

  // 1. Clear existing data
  await prisma.executionLog.deleteMany({});
  await prisma.execution.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.workflowStep.deleteMany({});
  await prisma.workflow.deleteMany({});
  await prisma.user.deleteMany({ where: { email: DEMO_USER_EMAIL } });

  // 2. Create User
  const hashedPassword = await bcrypt.hash('Machine100', 10);
  const user = await prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      password: hashedPassword,
    },
  });
  console.log(`✅ User created: ${user.email}`);

  // 3. Create Workflows
  const workflows = [
    {
      name: 'User Signup Automation',
      triggerType: 'user_signup',
      isActive: true,
      steps: [
        { stepOrder: 1, actionType: 'email', config: { to: '{{email}}', subject: 'Welcome to FlowForge!', body: 'Hi {{email}}, thanks for joining! 🚀' } },
        { stepOrder: 2, actionType: 'webhook', config: { url: 'https://api.crm.io/contacts', method: 'POST' } },
        { stepOrder: 3, actionType: 'delay', config: { seconds: '30' } },
        { stepOrder: 4, actionType: 'email', config: { to: '{{email}}', subject: 'Getting Started Guide', body: 'Here are 3 tips to get started...' } },
      ],
    },
    {
      name: 'Payment Failed Recovery',
      triggerType: 'payment_failed',
      isActive: true,
      steps: [
        { stepOrder: 1, actionType: 'email', config: { to: '{{email}}', subject: 'Payment Issue - Action Required', body: 'Hi {{email}}, your payment couldn\'t be processed.' } },
        { stepOrder: 2, actionType: 'webhook', config: { url: 'https://billing.stripe.com/retry', method: 'POST' } },
      ],
    },
    {
      name: 'Order Confirmation Pipeline',
      triggerType: 'order_placed',
      isActive: true,
      steps: [
        { stepOrder: 1, actionType: 'email', config: { to: '{{email}}', subject: 'Order Confirmed! 🎉', body: 'Your order #{{orderId}} has been confirmed.' } },
        { stepOrder: 2, actionType: 'webhook', config: { url: 'https://api.warehouse.io/fulfill', method: 'POST' } },
        { stepOrder: 3, actionType: 'delay', config: { seconds: '60' } },
      ],
    },
    {
      name: 'Churn Risk Alert',
      triggerType: 'user_inactive',
      isActive: false,
      steps: [
        { stepOrder: 1, actionType: 'webhook', config: { url: 'https://slack.com/api/chat.postMessage', method: 'POST' } },
        { stepOrder: 2, actionType: 'email', config: { to: '{{email}}', subject: 'We miss you!', body: 'Hi {{email}}, it\'s been a while. Here\'s 20% off.' } },
      ],
    },
  ];

  const createdWorkflows = [];
  for (const wf of workflows) {
    const created = await prisma.workflow.create({
      data: {
        userId: user.id,
        name: wf.name,
        triggerType: wf.triggerType,
        isActive: wf.isActive,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)), // Random date in last 10 days
        steps: {
          create: wf.steps,
        },
      },
    });
    createdWorkflows.push(created);
    console.log(`✅ Workflow created: ${created.name}`);
  }

  // 4. Create Events & Executions
  const statuses = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED'];
  
  for (let i = 0; i < 40; i++) {
    const wf = createdWorkflows[Math.floor(Math.random() * createdWorkflows.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random date within the last 7 days to populate activity chart beautifully
    const daysAgo = Math.random() * 7;
    const pastDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const event = await prisma.event.create({
      data: {
        type: wf.triggerType,
        payload: { email: `user${i}@example.com`, data: 'demo_event' },
        createdAt: pastDate,
      },
    });

    const execution = await prisma.execution.create({
      data: {
        workflowId: wf.id,
        eventId: event.id,
        status: status,
        startedAt: pastDate,
        finishedAt: new Date(pastDate.getTime() + 15000), // + 15 seconds
        logs: {
          create: [
            { stepOrder: 1, status: 'success', message: 'Step 1 completed successfully in 120ms', timestamp: pastDate },
            { stepOrder: 2, status: status === 'FAILED' ? 'failed' : 'success', message: status === 'FAILED' ? 'Step 2 FAILED after 5000ms. Error: Connection Timeout' : 'Step 2 completed successfully in 300ms', timestamp: new Date(pastDate.getTime() + 5000) }
          ]
        }
      }
    });
  }
  
  console.log(`✅ Generated 40 execution records across the last 7 days!`);

  console.log('🎉 Database seeding completed! You can log in with:');
  console.log('   Email: ' + DEMO_USER_EMAIL);
  console.log('   Password: Machine100');
};

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
