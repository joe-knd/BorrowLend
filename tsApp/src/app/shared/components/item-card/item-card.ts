import { Component, Input, signal } from '@angular/core';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-item-card',
  standalone: false,
  templateUrl: './item-card.html',
  styleUrl: './item-card.css',
})
export class ItemCard {
  @Input() item!: Item;
  showFullImage = false;
  readonly selectedDetailUserId = signal<string | null>(null);

  getStarArray(rating: number): boolean[] {
    const rounded = Math.round(rating);
    return [1, 2, 3, 4, 5].map(i => i <= rounded);
  }
}
