import { Component, inject, signal } from '@angular/core';
import { Items } from '../../../../core/services/items';
import { Auth } from '../../../../core/services/auth';
import { Item } from '../../../../shared/models/item.model';
import { Borrowings } from '../../../../core/services/borrowings';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-available-items',
  standalone: false,
  templateUrl: './available-items.html',
  styleUrl: './available-items.css',
})
export class AvailableItems {
  private itemsService = inject(Items);
  private borrowingsService = inject(Borrowings);
  private auth = inject(Auth);

  readonly items = signal<Item[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly selectedItemIds = signal<number[]>([]);
  readonly isSubmittingBorrow = signal(false);
  readonly borrowError = signal('');
  readonly borrowSuccess = signal('');

  ngOnInit() {
    this.loadAvailableItems();
  }

  isSelected(itemId: number): boolean {
    return this.selectedItemIds().includes(itemId);
  }

  toggleSelection(itemId: number): void {
    const current = this.selectedItemIds();
    const next = current.includes(itemId)
      ? current.filter(id => id !== itemId)
      : [...current, itemId];

    this.selectedItemIds.set(next);
  }

  borrowSelected(): void {
    if (this.isSubmittingBorrow()) {
      return;
    }

    const borrowerId = this.auth.currentUserId()?.trim();
    if (!borrowerId) {
      this.borrowError.set('Please sign in again before borrowing items.');
      return;
    }

    const itemIds = this.selectedItemIds();
    if (itemIds.length === 0) {
      this.borrowError.set('Select at least one item to borrow.');
      return;
    }

    this.borrowError.set('');
    this.borrowSuccess.set('');
    this.isSubmittingBorrow.set(true);

    const requests = itemIds.map(itemId =>
      this.borrowingsService.borrowItem(borrowerId, { itemId })
    );

    forkJoin(requests).subscribe({
      next: () => {
        const successCount = itemIds.length;
        this.borrowSuccess.set(`Borrow requests for ${successCount} item(s) submitted successfully. Waiting for owners' approval!`);
        this.selectedItemIds.set([]);
        this.isSubmittingBorrow.set(false);
        this.loadAvailableItems();
      },
      error: (err) => {
        this.borrowError.set(err?.error?.message ?? err?.message ?? 'Could not borrow selected items.');
        this.isSubmittingBorrow.set(false);
      }
    });
  }

  private loadAvailableItems(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.itemsService.getAvailable({
      excludeOwnerId: this.auth.currentUserId() ?? undefined,
      pageNumber: 1,
      pageSize: 20
    })
      .subscribe({
        next: (result: any) => {
          this.items.set(this.extractItems(result));
          this.isLoading.set(false);
        },
        error: (err) => {
          this.items.set([]);
          this.loadError.set(err?.error?.message ?? err?.message ?? 'Could not load available items.');
          this.isLoading.set(false);
        }
      });
  }

  private extractItems(payload: any): Item[] {
    const candidates = [
      payload?.items,
      payload?.Items,
      payload?.items?.$values,
      payload?.Items?.$values,
      payload?.data?.items,
      payload?.data?.Items,
      payload
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as Item[];
      }
    }

    return [];
  }
}
