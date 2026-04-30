import { Paginate } from '../types/result';

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
