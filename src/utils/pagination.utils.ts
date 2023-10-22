import { Prisma } from '@prisma/client';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    last_page: number;
    current_page: number;
    per_page: number;
    prev_page: number | null;
    next_page: number | null;
  };
}

export type PaginateOptions = {
  page?: number | string;
  perPage?: number | string;
};
export type PaginateFunction = <T>({
  model,
  args,
  options,
  map,
}: {
  model: T;
  args?: Prisma.Args<T, 'findMany'>;
  options?: PaginateOptions;
  map?: (data: Prisma.Result<T, null, 'findMany'>) => Promise<any[]>;
}) => Promise<PaginatedResult<Prisma.Result<T, null, 'findMany'>>>;

export const createPaginator = (
  defaultOptions: PaginateOptions,
): PaginateFunction => {
  return async ({
    model,
    args = { where: undefined },
    options,
    map,
  }: {
    model: any;
    args?: any;
    options?: PaginateOptions;
    map?: (data: any[]) => Promise<any[]>;
  }) => {
    const page = Number(options?.page || defaultOptions?.page) || 1;
    const perPage = Number(options?.perPage || defaultOptions?.perPage) || 10;

    const skip = page > 0 ? perPage * (page - 1) : 0;
    const [total, data] = await Promise.all([
      model.count({ where: args.where }),
      model.findMany({
        ...args,
        take: perPage,
        skip,
      }),
    ]);
    const lastPage = Math.ceil(total / perPage);

    return {
      data: map ? await map(data) : data,
      meta: {
        total,
        last_page: lastPage,
        current_page: page,
        per_page: perPage,
        prev_page: page > 1 ? page - 1 : null,
        next_page: page < lastPage ? page + 1 : null,
      },
    };
  };
};
