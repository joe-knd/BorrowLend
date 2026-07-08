import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ratings } from '../../../../core/services/ratings';

@Component({
  selector: 'app-user-ratings',
  standalone: false,
  templateUrl: './user-ratings.html',
  styleUrl: './user-ratings.css',
})
export class UserRatings {
  private route = inject(ActivatedRoute);
  private ratingsService = inject(Ratings);

  userId = this.route.snapshot.paramMap.get('id')!;
  readonly ratings = signal<any[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal('');

  ngOnInit() {
    this.isLoading.set(true);
    this.loadError.set('');

    this.ratingsService.getRatingsForUser(this.userId)
      .subscribe({
        next: (r: any) => {
          this.ratings.set(this.extractRatings(r));
          this.isLoading.set(false);
        },
        error: (err) => {
          this.ratings.set([]);
          this.loadError.set(err?.error?.message ?? err?.message ?? 'Could not load user ratings.');
          this.isLoading.set(false);
        }
      });
  }

  private extractRatings(payload: any): any[] {
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
        return candidate as any[];
      }
    }

    return [];
  }
}
