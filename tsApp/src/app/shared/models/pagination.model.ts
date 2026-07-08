import { Item } from './item.model';

export interface PaginatedItems {
  items: Item[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
