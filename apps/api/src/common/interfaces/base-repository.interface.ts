import { Prisma } from '@prisma/client';

export interface BaseRepository<T, CreateInput, UpdateInput> {
  findById(id: string, tenantId: string): Promise<T | null>;
  findMany(
    tenantId: string,
    options?: {
      where?: any;
      orderBy?: any;
      skip?: number;
      take?: number;
      include?: any;
    },
  ): Promise<T[]>;
  count(tenantId: string, where?: any): Promise<number>;
  create(data: CreateInput & { tenantId: string }): Promise<T>;
  update(id: string, tenantId: string, data: UpdateInput): Promise<T>;
  delete(id: string, tenantId: string): Promise<T>;
  transaction<R>(fn: (tx: Prisma.TransactionClient) => Promise<R>): Promise<R>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  filters?: Record<string, any>;
  include?: Record<string, boolean>;
}

export abstract class BaseRepositoryImpl<T, CreateInput, UpdateInput>
  implements BaseRepository<T, CreateInput, UpdateInput>
{
  constructor(protected readonly prisma: any) {}

  abstract findById(id: string, tenantId: string): Promise<T | null>;
  abstract findMany(
    tenantId: string,
    options?: {
      where?: any;
      orderBy?: any;
      skip?: number;
      take?: number;
      include?: any;
    },
  ): Promise<T[]>;
  abstract count(tenantId: string, where?: any): Promise<number>;
  abstract create(data: CreateInput & { tenantId: string }): Promise<T>;
  abstract update(id: string, tenantId: string, data: UpdateInput): Promise<T>;
  abstract delete(id: string, tenantId: string): Promise<T>;

  async transaction<R>(fn: (tx: Prisma.TransactionClient) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(fn);
  }

  protected buildWhereClause(tenantId: string, filters?: Record<string, any>): any {
    const where: any = { tenantId };

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          where[key] = value;
        }
      });
    }

    return where;
  }

  protected buildOrderBy(sort?: string): any {
    if (!sort) return { createdAt: 'desc' };

    const isDescending = sort.startsWith('-');
    const field = isDescending ? sort.substring(1) : sort;

    return { [field]: isDescending ? 'desc' : 'asc' };
  }

  protected calculatePagination(page: number = 1, limit: number = 20) {
    const pageSize = Math.min(Math.max(1, limit), 100);
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * pageSize;

    return { skip, take: pageSize, page: currentPage, pageSize };
  }
}
