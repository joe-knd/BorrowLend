export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  averageRating: number;
  totalRatings: number;
  createdAt: string; // ISO date
}
