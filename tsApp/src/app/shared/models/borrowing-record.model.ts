import { User } from './user.model';
import { Item } from './item.model';

export interface BorrowingRecord {
  id: number;
  itemId: number;
  item: Item;
  borrowerId: string;
  borrower: User;
  lenderId: string;
  lender: User;
  borrowedAt: string;
  dueDate?: string | null;
  returnedAt?: string | null;
  status: 'Requested' | 'Borrowed' | 'ReturnRequested' | 'ReturnPending' | 'Returned' | 'Lost' | 'Rejected';
  notes?: string | null;
}
