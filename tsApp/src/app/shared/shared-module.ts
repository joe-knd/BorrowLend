import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemCard } from './components/item-card/item-card';
import { UserCard } from './components/user-card/user-card';
import { RatingsDetailModal } from './components/ratings-detail-modal/ratings-detail-modal';
import { StatusColor } from './pipes/status-color-pipe';

@NgModule({
  declarations: [
    ItemCard,
    UserCard,
    RatingsDetailModal,
    StatusColor],
  imports: [CommonModule],
  exports: [
    ItemCard,
    UserCard,
    RatingsDetailModal,
    StatusColor
  ]
})
export class SharedModule {}
