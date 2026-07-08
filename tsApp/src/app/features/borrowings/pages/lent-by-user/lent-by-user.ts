import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Borrowings } from '../../../../core/services/borrowings';
import { BorrowingRecord } from '../../../../shared/models/borrowing-record.model';
import { Item } from '../../../../shared/models/item.model';

@Component({
  selector: 'app-lent-by-user',
  standalone: false,
  templateUrl: './lent-by-user.html',
  styleUrl: './lent-by-user.css',
})
export class LentByUser {
  private route = inject(ActivatedRoute);
  private borrowings = inject(Borrowings);

  userId = this.route.snapshot.paramMap.get('userId')!;
  readonly records = signal<BorrowingRecord[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal('');

  readonly items = computed<Item[]>(() => this.records()
    .map(record => record.item)
    .filter((item): item is Item => !!item));

  ngOnInit() {
    this.isLoading.set(true);
    this.loadError.set('');

    this.borrowings.getLentBy(this.userId)
      .subscribe({
        next: (records: any) => {
          this.records.set(this.extractRecords(records));
          this.isLoading.set(false);
        },
        error: (err) => {
          this.records.set([]);
          this.loadError.set(err?.error?.message ?? err?.message ?? 'Could not load lent items.');
          this.isLoading.set(false);
        }
      });
  }

  private extractRecords(payload: any): BorrowingRecord[] {
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
        return candidate as BorrowingRecord[];
      }
    }

    return [];
  }
}
