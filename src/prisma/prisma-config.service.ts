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
              ttl: 300,
            });

            return result;
          }

          if (params.action === 'findUnique' || params.action === 'findFirst') {
            if (
              params.model === 'ForgotPassword' ||
              params.model === 'SessionLogin'
            ) {
              return next(params);
            } else {
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
                  ttl: 300,
                });
              }

              return result;
            }
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
            const userId =
              params.args.where?.user_id ||
              params.args.data?.user_id ||
              params.args.data?.user?.user_id ||
              params.args.where?.user?.user_id ||
              params.args.where?.user?.user_id;

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
              await this.cacheManager.removeCacheByPatternWithFilter({
                key: `*${params.model}*`,
                filter: JSON.stringify({ user_id: userId }),
              });
            }

            if (params.model === 'Enrollment') {
              await this.cacheManager.removeCacheByPattern({
                key: `*Enrollment*`,
              });

              await this.cacheManager.removeCacheByPattern({
                key: `*Course*`,
              });

              await this.cacheManager.removeCacheByPattern({
                key: `*User*`,
              });
            }

            await this.cacheManager.removeCacheByPattern({
              key: `*${params.model}*`,
            });

            return next(params);
          }

          return next(params);
        },
      ],
    };
  }
}
