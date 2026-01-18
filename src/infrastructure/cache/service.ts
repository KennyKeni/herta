import type Redis from 'ioredis';
import { config } from '@/config';

export class CacheService {
  constructor(
    private client: Redis,
    private defaultTtl: number = config.cache.CACHE_MAX_AGE
  ) {}

  private get enabled(): boolean {
    return config.cache.CACHE_ENABLED;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;

    const data = await this.client.get(key);
    if (!data) return null;

    return JSON.parse(data) as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.enabled) return;

    await this.client.setex(key, ttl ?? this.defaultTtl, JSON.stringify(value));
  }

  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await fn();
    await this.set(key, value, ttl);
    return value;
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await this.client.del(key);
    return deleted > 0;
  }

  async deleteByPrefix(prefix: string): Promise<number> {
    const keys = await this.client.keys(`${prefix}*`);
    if (keys.length === 0) return 0;

    return this.client.del(...keys);
  }
}
