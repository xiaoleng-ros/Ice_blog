import { Paginate } from '../types/result';

export interface PaginateOptions<T = any> {
  where?: any;
  skip?: number;
  take?: number;
  select?: any;
  include?: any;
  orderBy?: any;
  model: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: { where?: any }) => Promise<number>;
  };
}

export function filter<T>(data: Paginate<T>): Record<string, any> {
  const { records, total, page, size, totalPages } = data;
  return {
    records,
    total,
    page,
    size,
    totalPages,
  };
}

export function calculatePagination(total: number, page: number, size: number): Paginate<any> {
  const totalPages = Math.ceil(total / size);
  return {
    records: [],
    total,
    page,
    size,
    totalPages,
  };
}

export async function paginate<T>(
  options: PaginateOptions<T>
): Promise<Paginate<T>> {
  const { model, where, skip = 0, take = 10, select, include, orderBy } = options;
  const findArgs: any = { where, skip, take };
  if (select) findArgs.select = select;
  if (include) findArgs.include = include;
  if (orderBy) findArgs.orderBy = orderBy;

  const [records, total] = await Promise.all([
    model.findMany(findArgs) as Promise<T[]>,
    model.count({ where }),
  ]);

  const page = Math.floor(skip / take) + 1;
  return {
    records,
    total,
    page,
    size: take,
    totalPages: Math.ceil(total / take),
  };
}
