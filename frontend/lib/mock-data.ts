// lib/mock-data.ts
// Realistic demo data for the dashboard when backend isn't connected
// This lets you record a polished Loom video without needing PostgreSQL + Redis

export const DEMO_MODE = false; // Set to false when backend is running

const now = new Date();
const ago = (hours: number) => new Date(now.getTime() - hours * 3600_000).toISOString();

export const mockUser = {
  id: "usr_01HQ3KXYZ",
  email: "saad.arif@azkytech.com",
  createdAt: ago(720), // 30 days ago
  _count: { workflows: 5 },
};

export const mockWorkflows = [
  {
    id: "wf_01",
    name: "User Signup Automation",
    triggerType: "user_signup",
    isActive: true,
    createdAt: ago(168),
    updatedAt: ago(2),
    userId: mockUser.id,
    steps: [
      { id: "s1", stepOrder: 1, actionType: "email", config: { to: "{{email}}", subject: "Welcome to FlowForge!", body: "Hi {{email}}, thanks for joining! 🚀" }, workflowId: "wf_01" },
      { id: "s2", stepOrder: 2, actionType: "webhook", config: { url: "https://api.crm.io/contacts", method: "POST" }, workflowId: "wf_01" },
      { id: "s3", stepOrder: 3, actionType: "delay", config: { seconds: "30" }, workflowId: "wf_01" },
      { id: "s4", stepOrder: 4, actionType: "email", config: { to: "{{email}}", subject: "Getting Started Guide", body: "Here are 3 tips to get started..." }, workflowId: "wf_01" },
    ],
    _count: { executions: 47 },
  },
  {
    id: "wf_02",
    name: "Payment Failed Recovery",
    triggerType: "payment_failed",
    isActive: true,
    createdAt: ago(120),
    updatedAt: ago(8),
    userId: mockUser.id,
    steps: [
      { id: "s5", stepOrder: 1, actionType: "email", config: { to: "{{email}}", subject: "Payment Issue - Action Required", body: "Hi {{email}}, your payment couldn't be processed." }, workflowId: "wf_02" },
      { id: "s6", stepOrder: 2, actionType: "webhook", config: { url: "https://billing.stripe.com/retry", method: "POST" }, workflowId: "wf_02" },
    ],
    _count: { executions: 12 },
  },
  {
    id: "wf_03",
    name: "Order Confirmation Pipeline",
    triggerType: "order_placed",
    isActive: true,
    createdAt: ago(96),
    updatedAt: ago(1),
    userId: mockUser.id,
    steps: [
      { id: "s7", stepOrder: 1, actionType: "email", config: { to: "{{email}}", subject: "Order Confirmed! 🎉", body: "Your order #{{orderId}} has been confirmed." }, workflowId: "wf_03" },
      { id: "s8", stepOrder: 2, actionType: "webhook", config: { url: "https://api.warehouse.io/fulfill", method: "POST" }, workflowId: "wf_03" },
      { id: "s9", stepOrder: 3, actionType: "delay", config: { seconds: "60" }, workflowId: "wf_03" },
    ],
    _count: { executions: 89 },
  },
  {
    id: "wf_04",
    name: "Churn Risk Alert",
    triggerType: "user_inactive",
    isActive: false,
    createdAt: ago(240),
    updatedAt: ago(72),
    userId: mockUser.id,
    steps: [
      { id: "s10", stepOrder: 1, actionType: "webhook", config: { url: "https://slack.com/api/chat.postMessage", method: "POST" }, workflowId: "wf_04" },
      { id: "s11", stepOrder: 2, actionType: "email", config: { to: "{{email}}", subject: "We miss you!", body: "Hi {{email}}, it's been a while. Here's 20% off." }, workflowId: "wf_04" },
    ],
    _count: { executions: 5 },
  },
  {
    id: "wf_05",
    name: "Daily Report Generator",
    triggerType: "cron_daily",
    isActive: true,
    createdAt: ago(336),
    updatedAt: ago(24),
    userId: mockUser.id,
    steps: [
      { id: "s12", stepOrder: 1, actionType: "webhook", config: { url: "https://api.analytics.io/report/generate", method: "POST" }, workflowId: "wf_05" },
      { id: "s13", stepOrder: 2, actionType: "delay", config: { seconds: "10" }, workflowId: "wf_05" },
      { id: "s14", stepOrder: 3, actionType: "email", config: { to: "team@company.com", subject: "Daily Report Ready", body: "Your daily analytics report is attached." }, workflowId: "wf_05" },
    ],
    _count: { executions: 31 },
  },
];

export const mockExecutions: Record<string, any[]> = {
  wf_01: [
    {
      id: "exec_01", workflowId: "wf_01", eventId: "evt_01", status: "SUCCESS",
      startedAt: ago(0.5), finishedAt: ago(0.48),
      logs: [
        { id: "l1", stepOrder: 1, status: "success", message: "Step 1 [email] completed in 245ms. Result: {\"messageId\":\"<abc@mail>\",\"accepted\":[\"newuser@test.com\"]}", timestamp: ago(0.5) },
        { id: "l2", stepOrder: 2, status: "success", message: "Step 2 [webhook] completed in 312ms. Result: {\"status\":200,\"statusText\":\"OK\"}", timestamp: ago(0.49) },
        { id: "l3", stepOrder: 3, status: "success", message: "Step 3 [delay] completed in 30002ms. Result: {\"waited\":30}", timestamp: ago(0.485) },
        { id: "l4", stepOrder: 4, status: "success", message: "Step 4 [email] completed in 198ms. Result: {\"messageId\":\"<def@mail>\",\"accepted\":[\"newuser@test.com\"]}", timestamp: ago(0.48) },
      ],
    },
    {
      id: "exec_02", workflowId: "wf_01", eventId: "evt_02", status: "SUCCESS",
      startedAt: ago(3), finishedAt: ago(2.98),
      logs: [
        { id: "l5", stepOrder: 1, status: "success", message: "Step 1 [email] completed in 201ms.", timestamp: ago(3) },
        { id: "l6", stepOrder: 2, status: "success", message: "Step 2 [webhook] completed in 287ms.", timestamp: ago(2.99) },
        { id: "l7", stepOrder: 3, status: "success", message: "Step 3 [delay] completed in 30001ms.", timestamp: ago(2.985) },
        { id: "l8", stepOrder: 4, status: "success", message: "Step 4 [email] completed in 210ms.", timestamp: ago(2.98) },
      ],
    },
    {
      id: "exec_03", workflowId: "wf_01", eventId: "evt_03", status: "FAILED",
      startedAt: ago(6), finishedAt: ago(5.99),
      logs: [
        { id: "l9", stepOrder: 1, status: "success", message: "Step 1 [email] completed in 230ms.", timestamp: ago(6) },
        { id: "l10", stepOrder: 2, status: "failed", message: "Step 2 [webhook] FAILED after 10002ms. Error: Request timeout — target server did not respond", timestamp: ago(5.99) },
      ],
    },
    {
      id: "exec_04", workflowId: "wf_01", eventId: "evt_04", status: "SUCCESS",
      startedAt: ago(12), finishedAt: ago(11.98),
      logs: [
        { id: "l11", stepOrder: 1, status: "success", message: "Step 1 [email] completed in 189ms.", timestamp: ago(12) },
        { id: "l12", stepOrder: 2, status: "success", message: "Step 2 [webhook] completed in 301ms.", timestamp: ago(11.99) },
        { id: "l13", stepOrder: 3, status: "success", message: "Step 3 [delay] completed in 30000ms.", timestamp: ago(11.985) },
        { id: "l14", stepOrder: 4, status: "success", message: "Step 4 [email] completed in 175ms.", timestamp: ago(11.98) },
      ],
    },
  ],
  wf_02: [
    {
      id: "exec_05", workflowId: "wf_02", eventId: "evt_05", status: "SUCCESS",
      startedAt: ago(8), finishedAt: ago(7.99),
      logs: [
        { id: "l15", stepOrder: 1, status: "success", message: "Step 1 [email] completed in 210ms.", timestamp: ago(8) },
        { id: "l16", stepOrder: 2, status: "success", message: "Step 2 [webhook] completed in 445ms.", timestamp: ago(7.99) },
      ],
    },
  ],
  wf_03: [
    {
      id: "exec_06", workflowId: "wf_03", eventId: "evt_06", status: "RUNNING",
      startedAt: ago(0.01), finishedAt: null,
      logs: [
        { id: "l17", stepOrder: 1, status: "success", message: "Step 1 [email] completed in 195ms.", timestamp: ago(0.01) },
      ],
    },
    {
      id: "exec_07", workflowId: "wf_03", eventId: "evt_07", status: "SUCCESS",
      startedAt: ago(1), finishedAt: ago(0.98),
      logs: [
        { id: "l18", stepOrder: 1, status: "success", message: "Step 1 [email] completed in 220ms.", timestamp: ago(1) },
        { id: "l19", stepOrder: 2, status: "success", message: "Step 2 [webhook] completed in 389ms.", timestamp: ago(0.99) },
        { id: "l20", stepOrder: 3, status: "success", message: "Step 3 [delay] completed in 60001ms.", timestamp: ago(0.98) },
      ],
    },
  ],
};

export const mockEvents = [
  { id: "evt_01", type: "user_signup", payload: { email: "alice@startup.io", name: "Alice Chen" }, createdAt: ago(0.5) },
  { id: "evt_06", type: "order_placed", payload: { email: "bob@shop.com", orderId: "ORD-4821" }, createdAt: ago(0.01) },
  { id: "evt_05", type: "payment_failed", payload: { email: "charlie@biz.co", amount: 99.99, currency: "USD" }, createdAt: ago(8) },
  { id: "evt_02", type: "user_signup", payload: { email: "diana@tech.dev", name: "Diana Ross" }, createdAt: ago(3) },
  { id: "evt_07", type: "order_placed", payload: { email: "eve@market.io", orderId: "ORD-4820" }, createdAt: ago(1) },
  { id: "evt_03", type: "user_signup", payload: { email: "frank@agency.com", name: "Frank Miller" }, createdAt: ago(6) },
  { id: "evt_04", type: "user_signup", payload: { email: "grace@saas.io", name: "Grace Hopper" }, createdAt: ago(12) },
  { id: "evt_08", type: "cron_daily", payload: { date: "2026-05-03" }, createdAt: ago(24) },
  { id: "evt_09", type: "user_inactive", payload: { email: "henry@old.com", daysSinceLogin: 30 }, createdAt: ago(48) },
];
