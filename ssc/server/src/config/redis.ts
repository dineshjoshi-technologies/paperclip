import Redis from 'ioredis';
import { config } from '../config';

export const redis = new Redis(config.redis.url, {
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 50, 1000);
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

export async function setCache(key: string, value: string, ttlSeconds?: number) {
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, value);
  } else {
    await redis.set(key, value);
  }
}

export async function getCache(key: string): Promise<string | null> {
  return redis.get(key);
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function invalidatePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
