import { PaginatedDto, PaginationMeta } from '../dto/paginated.dto';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
}

export function createPaginatedResponse<T>(
  result: PaginationResult<T>,
  options: PaginationOptions,
): PaginatedDto<T> {
  const { data, total } = result;
  const { page, limit } = options;

  const totalPages = Math.ceil(total / limit);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasPrevious,
    hasNext,
  };

  return { data, meta };
}

export function getPrismaSkipTake(options: PaginationOptions) {
  const { page, limit } = options;
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function getSequelizeOffsetLimit(options: PaginationOptions) {
  const { page, limit } = options;
  return {
    offset: (page - 1) * limit,
    limit,
  };
}
