import { Redis } from "ioredis";

import { env } from "../../env";
import { logger } from "../../utils/logger";

export class CacheService {
  private client: Redis;

  constructor() {
    this.client = new Redis(env.REDIS_URL);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      logger.error({ error, key }, "Cache get error");
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.set(key, JSON.stringify(value), "EX", ttl);
      } else {
        await this.client.set(key, JSON.stringify(value));
      }
    } catch (error) {
      logger.error({ error, key }, "Cache set error");
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.client.mget(keys);
      return values.map((v) => (v ? (JSON.parse(v) as T) : null));
    } catch (error) {
      logger.error({ error, keys }, "Cache mget error");
      return keys.map(() => null);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

export const cacheService = new CacheService();
