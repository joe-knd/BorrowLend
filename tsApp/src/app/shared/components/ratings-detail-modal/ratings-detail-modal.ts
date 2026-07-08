import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { Ratings } from '../../../core/services/ratings';
import { Users } from '../../../core/services/users';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-ratings-detail-modal',
  standalone: false,
  templateUrl: './ratings-detail-modal.html',
  styleUrl: './ratings-detail-modal.css'
})
export class RatingsDetailModal {
  private ratingsService = inject(Ratings);
  private usersService = inject(Users);

  @Input() userId!: string;
  @Output() close = new EventEmitter<void>();

  readonly ratings = signal<any[]>([]);
  readonly user = signal<User | null>(null);
  readonly isLoading = signal(false);
  readonly loadError = signal('');

  ngOnChanges() {
    if (this.userId) {
      this.loadData();
    }
  }

  private loadData() {
    this.isLoading.set(true);
    this.loadError.set('');
    
    // Load User info
    this.usersService.getById(this.userId).subscribe({
      next: (u: User) => this.user.set(u),
      error: () => this.user.set(null)
    });

    // Load User Ratings
    this.ratingsService.getRatingsForUser(this.userId).subscribe({
      next: (r: any) => {
        this.ratings.set(this.extractArray(r));
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.ratings.set([]);
        this.loadError.set(err?.error?.message ?? err?.message ?? 'Could not load reviews.');
        this.isLoading.set(false);
      }
    });
  }

  getStarArray(rating: number): boolean[] {
    const rounded = Math.round(rating);
    return [1, 2, 3, 4, 5].map(i => i <= rounded);
  }

  private extractArray<T>(payload: any): T[] {
    const candidates = [
      payload,
      payload?.items,
      payload?.Items,
      payload?.data,
      payload?.$values,
      payload?.items?.$values,
      payload?.data?.$values
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as T[];
      }
    }
    return [];
  }
}
