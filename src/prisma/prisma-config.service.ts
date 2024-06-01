import { Injectable } from '@nestjs/common';
import { PrismaOptionsFactory, PrismaServiceOptions } from 'nestjs-prisma';
import { CacheManagerService } from '../utils/cache-manager/cache-manager.service';

@Injectable()
export class PrismaConfigService implements PrismaOptionsFactory {
  constructor(private readonly cacheManager: CacheManagerService) {}

  createPrismaOptions(): PrismaServiceOptions | Promise<PrismaServiceOptions> {
    return {
      prismaOptions: {
        log: ['error', 'warn'],
      },
      middlewares: [
        async (params, next) => {
          if (params.action === 'findMany') {
            const key = `findMany:${params.model}:${JSON.stringify(params.args)}`;
            const cached = await this.cacheManager.getCache({
              key,
            });

            if (cached) {
              return cached;
            }

            const result = await next(params);
            await this.cacheManager.setCache({
              key,
              value: result,
            });

            return result;
          }

          if (params.action === 'findUnique' || params.action === 'findFirst') {
            const key = `${params.action}:${params.model}:${JSON.stringify(params.args)}`;
            const cached = await this.cacheManager.getCache({
              key,
            });

            if (cached) {
              return cached;
            }

            const result = await next(params);
            if (result) {
              await this.cacheManager.setCache({
                key,
                value: result,
              });
            }

            return result;
          }

          if (
            params.action === 'create' ||
            params.action === 'update' ||
            params.action === 'delete' ||
            params.action === 'deleteMany' ||
            params.action === 'updateMany' ||
            params.action === 'createMany' ||
            params.action === 'upsert'
          ) {
            console.log(params);
            if (params.model === 'User') {
              await this.cacheManager.removeCacheByPattern({
                key: `*User*`,
              });
            }

            if (
              params.args.where?.user_id ||
              params.args.data?.user_id ||
              params.args.data?.user?.user_id ||
              params.args.where?.user?.user_id ||
              params.args.where?.user?.user_id
            ) {
              const userId =
                params.args.where?.user_id ||
                params.args.data?.user_id ||
                params.args.data?.user?.user_id ||
                params.args.where?.user?.user_id ||
                params.args.where?.user?.user_id;
              await this.cacheManager.removeCacheByPatternWithFilter({
                key: `*${params.model}*`,
                filter: JSON.stringify({ user_id: userId }),
              });
            }

            return next(params);
          }

          return next(params);
        },
      ],
    };
  }
}
