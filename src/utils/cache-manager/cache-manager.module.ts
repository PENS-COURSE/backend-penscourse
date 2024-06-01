import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import { CacheManagerService } from './cache-manager.service';
const redisStore = require('cache-manager-redis-store').redisStore;

@Global()
@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: process.env.REDIS_URL,
    }),
  ],
  providers: [CacheManagerService],
  exports: [CacheManagerService],
})
export class CacheManagerModule {}
