import { Component, inject, signal } from '@angular/core';
import { Items } from '../../../../core/services/items';
import { Auth } from '../../../../core/services/auth';
import { Borrowings } from '../../../../core/services/borrowings';
import { Item } from '../../../../shared/models/item.model';
import { BorrowingRecord } from '../../../../shared/models/borrowing-record.model';

@Component({
  selector: 'app-items-list',
  standalone: false,
  templateUrl: './items-list.html',
  styleUrl: './items-list.css',
})
export class ItemsList {
  private itemsService = inject(Items);
  private borrowingsService = inject(Borrowings);
  private auth = inject(Auth);

  readonly items = signal<Item[]>([]);
  readonly borrowRequests = signal<BorrowingRecord[]>([]);
  readonly ownerIdSent = signal('');
  readonly lastResponseItemsCount = signal(0);
  readonly fallbackItemsCount = signal(0);
  readonly usedFallback = signal(false);
  readonly loadError = signal('');
  readonly lastFetchAt = signal('');
  readonly isLoading = signal(false);
  readonly isActionLoading = signal(false);
  readonly actionError = signal('');

  ngOnInit() {
    const rawUserId = this.auth.currentUserId()?.trim();
    const userId = this.normalizeOwnerId(rawUserId);
    this.ownerIdSent.set(userId ?? '');
    this.loadError.set('');
    this.usedFallback.set(false);
    this.fallbackItemsCount.set(0);
    this.lastFetchAt.set(new Date().toISOString());
    this.isLoading.set(true);

    if (!userId) {
      this.items.set([]);
      this.lastResponseItemsCount.set(0);
      this.loadError.set('No signed-in user found. Please sign in again.');
      this.isLoading.set(false);
      return;
    }

    this.loadItems(userId);
    this.loadBorrowRequests(userId);
  }

  loadItems(userId: string) {
    this.itemsService.getOwnedBy(userId, 1, 100)
      .subscribe({
        next: (result: any) => {
          const parsedItems = this.extractItems(result);
          this.items.set(parsedItems);
          this.lastResponseItemsCount.set(parsedItems.length);

          if (parsedItems.length === 0) {
            this.loadViaFallbackQuery(userId);
            return;
          }

          this.isLoading.set(false);
        },
        error: (err) => {
          this.items.set([]);
          this.lastResponseItemsCount.set(0);
          this.loadError.set(err?.error?.message ?? err?.message ?? 'Could not load items for the current owner.');
          this.loadViaFallbackQuery(userId);
        }
      });
  }

  loadBorrowRequests(userId: string) {
    this.borrowingsService.getLentBy(userId).subscribe({
      next: (records: any) => {
        const list = this.extractRecords(records);
        // Only keep 'Requested' status
        this.borrowRequests.set(list.filter(r => r.status === 'Requested'));
      },
      error: () => {
        this.borrowRequests.set([]);
      }
    });
  }

  approveRequest(record: BorrowingRecord) {
    const userId = this.ownerIdSent();
    if (!userId || this.isActionLoading()) return;

    this.actionError.set('');
    this.isActionLoading.set(true);
    this.borrowingsService.approveBorrow(record.id, userId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        this.loadItems(userId);
        this.loadBorrowRequests(userId);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? err?.message ?? 'Could not approve request.');
        this.isActionLoading.set(false);
      }
    });
  }

  rejectRequest(record: BorrowingRecord) {
    const userId = this.ownerIdSent();
    if (!userId || this.isActionLoading()) return;

    this.actionError.set('');
    this.isActionLoading.set(true);
    this.borrowingsService.rejectBorrow(record.id, userId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        this.loadBorrowRequests(userId);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? err?.message ?? 'Could not reject request.');
        this.isActionLoading.set(false);
      }
    });
  }

  toggleDisable(item: Item) {
    const userId = this.ownerIdSent();
    if (!userId || this.isActionLoading()) return;

    this.actionError.set('');
    this.isActionLoading.set(true);
    this.itemsService.toggleDisable(item.id, userId).subscribe({
      next: (updatedItem: any) => {
        this.items.update(list => list.map(i => i.id === item.id ? { ...i, isDisabled: updatedItem.isDisabled || updatedItem.IsDisabled } : i));
        this.isActionLoading.set(false);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? err?.message ?? 'Could not toggle item state.');
        this.isActionLoading.set(false);
      }
    });
  }

  deleteItem(item: Item) {
    const userId = this.ownerIdSent();
    if (!userId || this.isActionLoading()) return;

    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    this.actionError.set('');
    this.isActionLoading.set(true);
    this.itemsService.deleteItem(item.id, userId).subscribe({
      next: () => {
        this.items.update(list => list.filter(i => i.id !== item.id));
        this.isActionLoading.set(false);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? err?.message ?? 'Could not delete item.');
        this.isActionLoading.set(false);
      }
    });
  }

  private loadViaFallbackQuery(userId: string): void {
    this.itemsService.getAll({ pageNumber: 1, pageSize: 100, cacheBuster: Date.now() })
      .subscribe({
        next: (result: any) => {
          const fallbackItems = this.extractItems(result)
            .filter(item => this.sameOwnerId(item.ownerId, userId));
          this.fallbackItemsCount.set(fallbackItems.length);

          if (fallbackItems.length > 0) {
            this.items.set(fallbackItems);
            this.usedFallback.set(true);
            this.loadError.set('');
          }

          this.isLoading.set(false);
        },
        error: () => {
          this.fallbackItemsCount.set(0);
          this.isLoading.set(false);
        }
      });
  }

  private normalizeOwnerId(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const normalized = value.trim().replace(/^"|"$/g, '');
    return normalized.length > 0 ? normalized : null;
  }

  private sameOwnerId(left: string | null | undefined, right: string | null | undefined): boolean {
    const a = this.normalizeOwnerId(left);
    const b = this.normalizeOwnerId(right);

    if (!a || !b) {
      return false;
    }

    return a.toLowerCase() === b.toLowerCase();
  }

  private extractItems(payload: any): Item[] {
    const candidates = [
      payload?.items,
      payload?.Items,
      payload?.data?.items,
      payload?.data?.Items,
      payload?.items?.$values,
      payload?.Items?.$values,
      payload?.data?.items?.$values,
      payload?.data?.Items?.$values,
      payload?.$values,
      payload
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate
          .map(item => this.normalizeItem(item))
          .filter((item): item is Item => item !== null);
      }
    }

    return [];
  }

  private normalizeItem(raw: any): Item | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const id = raw.id ?? raw.Id;
    const name = raw.name ?? raw.Name;
    const ownerId = this.normalizeOwnerId(raw.ownerId ?? raw.OwnerId);

    if (typeof id !== 'number' || typeof name !== 'string' || !ownerId) {
      return null;
    }

    return {
      id,
      name,
      description: raw.description ?? raw.Description ?? '',
      ownerId,
      owner: raw.owner ?? raw.Owner,
      status: (raw.status ?? raw.Status ?? 'Available') as Item['status'],
      createdAt: raw.createdAt ?? raw.CreatedAt ?? '',
      lastBorrowedAt: raw.lastBorrowedAt ?? raw.LastBorrowedAt ?? null,
      imageUrl: raw.imageUrl ?? raw.ImageUrl ?? null,
      isDisabled: raw.isDisabled ?? raw.IsDisabled ?? false
    };
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
