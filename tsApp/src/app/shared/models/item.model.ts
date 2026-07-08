import { User } from './user.model';

export interface Item {
  id: number;
  name: string;
  description?: string;
  ownerId: string;
  owner: User;
  status: 'Available' | 'Borrowed' | 'Lost' | 'Disabled';
  createdAt: string;
  lastBorrowedAt?: string | null;
  imageUrl?: string | null;
  isDisabled?: boolean;
}
