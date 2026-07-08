import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Items } from '../../../../core/services/items';
import { Users } from '../../../../core/services/users';
import { Item } from '../../../../shared/models/item.model';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-item-details',
  standalone: false,
  templateUrl: './item-details.html',
  styleUrl: './item-details.css',
})
export class ItemDetails {
  private route = inject(ActivatedRoute);
  private itemsService = inject(Items);
  private usersService = inject(Users);

  itemId = Number(this.route.snapshot.paramMap.get('id'));
  readonly item = signal<Item | null>(null);
  readonly owner = signal<User | null>(null);
  readonly isLoadingItem = signal(false);
  readonly isLoadingOwner = signal(false);
  readonly loadError = signal('');

  ngOnInit() {
    this.isLoadingItem.set(true);
    this.loadError.set('');

    this.itemsService.getById(this.itemId).subscribe({
      next: (item) => {
        this.item.set(item);
        this.isLoadingItem.set(false);
        this.loadOwner(item.ownerId);
      },
      error: (err) => {
        this.item.set(null);
        this.owner.set(null);
        this.loadError.set(err?.error?.message ?? err?.message ?? 'Could not load item details.');
        this.isLoadingItem.set(false);
      }
    });
  }

  loadOwner(ownerId: string) {
    this.isLoadingOwner.set(true);

    this.usersService.getById(ownerId).subscribe({
      next: (u) => {
        this.owner.set(u);
        this.isLoadingOwner.set(false);
      },
      error: () => {
        this.owner.set(null);
        this.isLoadingOwner.set(false);
      }
    });
  }
}
