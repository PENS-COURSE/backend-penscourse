import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheManagerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Set cache
   * @param key
   * @param value
   * @param ttl
   */
  async setCache<T>({
    key,
    value,
    ttl = 1000,
  }: {
    key: string;
    value: T;
    ttl?: number;
  }) {
    return await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Get cache by key
   * @param key
   */
  async getCache({ key }: { key: string }) {
    return await this.cacheManager.get(key);
  }

  /**
   * Delete cache by key
   * @param key
   */
  async deleteCache({ key }: { key: string }) {
    return await this.cacheManager.del(key);
  }

  /**
   * Clear all cache
   */
  async clearCache() {
    return await this.cacheManager.reset();
  }

  /**
   * Get cache by pattern
   */
  async getCacheByPattern({ key }: { key: string }) {
    return await this.cacheManager.store.keys(key);
  }

  /**
   * Remove cache by pattern
   */
  async removeCacheByPattern({ key }: { key: string }) {
    const keys = await this.getCacheByPattern({ key: key });
    return await Promise.all(keys.map((key) => this.deleteCache({ key })));
  }

  /**
   * Remove cache by pattern with filter
   */
  async removeCacheByPatternWithFilter({
    key,
    filter,
  }: {
    key: string;
    filter: string;
  }) {
    const keys = await this.getCacheByPattern({ key });
    return await Promise.all(
      keys.map((key) => {
        if (key.includes(filter)) {
          return this.deleteCache({ key });
        }
      }),
    );
  }
}
