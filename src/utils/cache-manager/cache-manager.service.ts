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
  async setCache({
    key,
    value,
    ttl = 1000,
  }: {
    key: string;
    value: any;
    ttl: number;
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
}
