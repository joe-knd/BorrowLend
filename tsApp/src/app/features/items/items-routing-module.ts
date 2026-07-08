import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ItemsList } from './pages/items-list/items-list';
import { AvailableItems } from './pages/available-items/available-items';
import { CreateItem } from './pages/create-item/create-item';
import { EditItem } from './pages/edit-item/edit-item';
import { ItemDetails } from './pages/item-details/item-details';

const routes: Routes = [
  { path: '', component: ItemsList },
  { path: 'available', component: AvailableItems },
  { path: 'create', component: CreateItem },
  { path: 'edit/:id', component: EditItem },
  { path: ':id', component: ItemDetails }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemsRoutingModule {}
