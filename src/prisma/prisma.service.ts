import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }
  async onModuleInit() {
    await this.$connect();

    Object.assign(
      this,
      this.$extends({
        query: {
          course: {
            async update({ args, query }) {
              if (args.data.price) {
                if (args.data.price) {
                  args.data.is_free = false;
                } else if (args.data.price === null || args.data.price === 0) {
                  args.data.is_free = true;
                  args.data.price = null;
                }
              }

              return query(args);
            },
          },
        },
      }),
    );
  }
}
