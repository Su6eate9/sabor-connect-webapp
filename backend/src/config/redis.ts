import Redis from 'ioredis';
import { logInfo, logError } from './logger';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logInfo('Redis connected successfully');
});

redis.on('error', (error) => {
  logError('Redis connection error', error);
});

redis.on('ready', () => {
  logInfo('Redis is ready to accept connections');
});

redis.on('close', () => {
  logInfo('Redis connection closed');
});

// Helper para cache com TTL
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logError('Cache get error', error, { key });
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: any,
  ttlSeconds: number = 300
): Promise<void> => {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logError('Cache set error', error, { key, ttl: ttlSeconds });
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    logError('Cache delete error', error, { key });
  }
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logError('Cache delete pattern error', error, { pattern });
  }
};

export default redis;
