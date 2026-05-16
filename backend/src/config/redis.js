// src/config/redis.js
// Redis connection using ioredis — shared across queue & cache

const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

const redisConfig = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
};

if (env.REDIS_PASSWORD) {
  redisConfig.password = env.REDIS_PASSWORD;
}

const redis = new Redis(redisConfig);

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error(`Redis error: ${err.message}`));

module.exports = redis;
