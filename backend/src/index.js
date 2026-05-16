// src/index.js
// Application entry point — connects to DB and starts the HTTP server

require('dotenv').config();

const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');
const logger = require('./utils/logger');

const PORT = parseInt(env.PORT, 10) || 3000;

const start = async () => {
  try {
    // Verify database connection on startup
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected via Prisma');

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}/api/v1`);
      logger.info(`   Environment: ${env.NODE_ENV}`);
      logger.info(`   Health: http://localhost:${PORT}/api/v1/health`);
    });

    // ── Graceful Shutdown ────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected. Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    // Unhandled promise rejection guard
    process.on('unhandledRejection', (reason) => {
      logger.error(`Unhandled Rejection: ${reason}`);
      process.exit(1);
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
