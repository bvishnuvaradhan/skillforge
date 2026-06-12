import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;
  private readonly logger = new Logger(RedisService.name);

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    this.logger.log(`Connecting to Redis at: ${redisUrl}`);
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully.');
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
      this.logger.log('Redis connection disconnected.');
    }
  }

  /**
   * Set a key in Redis with a TTL (in seconds)
   */
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.error(`Failed to set key ${key} in Redis:`, error);
    }
  }

  /**
   * Get a value from Redis by key
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key ${key} from Redis:`, error);
      return null;
    }
  }

  /**
   * Increment a counter in Redis, setting a TTL if it's a new key
   */
  async incrAndExpire(key: string, ttlSeconds: number): Promise<number> {
    try {
      const value = await this.client.incr(key);
      if (value === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      return value;
    } catch (error) {
      this.logger.error(`Failed to increment key ${key} in Redis:`, error);
      return 0;
    }
  }

  /**
   * Check if a key exists in Redis
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key} in Redis:`, error);
      return false;
    }
  }

  /**
   * Delete a key from Redis
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key} from Redis:`, error);
    }
  }

  /**
   * Get the TTL (time to live) of a key in seconds
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL of key ${key} from Redis:`, error);
      return -1;
    }
  }

  /**
   * Push an item to a Redis list
   */
  async lpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.lpush(key, value);
    } catch (error) {
      this.logger.error(`Failed to lpush key ${key} in Redis:`, error);
      return 0;
    }
  }

  /**
   * Get elements from a Redis list in a range
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to lrange key ${key} in Redis:`, error);
      return [];
    }
  }

  /**
   * Trim a Redis list to the specified range
   */
  async ltrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.client.ltrim(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to ltrim key ${key} in Redis:`, error);
    }
  }

  /**
   * Set key expiration in seconds
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.expire(key, ttlSeconds);
    } catch (error) {
      this.logger.error(`Failed to set expire for key ${key} in Redis:`, error);
    }
  }
}
