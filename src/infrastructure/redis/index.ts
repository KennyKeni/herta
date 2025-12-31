import Redis from 'ioredis';
import { config } from '../../config';

export const redis = new Redis({
  host: config.redis.REDIS_HOST,
  port: config.redis.REDIS_PORT,
  password: config.redis.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  console.error('[redis] Connection error:', err.message);
});

redis.on('connect', () => {
  console.log('[redis] Connected');
});
