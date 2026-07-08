import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Borrowings } from '../../../../core/services/borrowings';
import { BorrowingRecord } from '../../../../shared/models/borrowing-record.model';
import { Item } from '../../../../shared/models/item.model';

@Component({
  selector: 'app-borrowed-by-user',
  standalone: false,
  templateUrl: './borrowed-by-user.html',
  styleUrl: './borrowed-by-user.css',
})
export class BorrowedByUser {
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

    this.borrowings.getBorrowedBy(this.userId)
      .subscribe({
        next: (records: any) => {
          this.records.set(this.extractRecords(records));
          this.isLoading.set(false);
        },
        error: (err) => {
          this.records.set([]);
          this.loadError.set(err?.error?.message ?? err?.message ?? 'Could not load borrowed items.');
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
