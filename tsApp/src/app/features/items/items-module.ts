import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared-module';
import { ItemsRoutingModule } from './items-routing-module';

import { ItemsList } from './pages/items-list/items-list';
import { AvailableItems } from './pages/available-items/available-items';
import { CreateItem } from './pages/create-item/create-item';
import { EditItem } from './pages/edit-item/edit-item';
import { ItemDetails } from './pages/item-details/item-details';

@NgModule({
  declarations: [
    ItemsList,
    AvailableItems,
    CreateItem,
    EditItem,
    ItemDetails],
  imports: [
    CommonModule,
    ItemsRoutingModule,
    SharedModule,
    ReactiveFormsModule],
})
export class ItemsModule {}
