import { User } from './user.model';

export interface Rating {
  id: number;
  ratedUserId: string;
  ratedUser: User;
  raterUserId: string;
  raterUser: User;
  borrowingRecordId: number;
  rating: number; // 1–5
  comment?: string;
  createdAt: string;
}
