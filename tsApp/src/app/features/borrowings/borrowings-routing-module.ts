import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BorrowedByUser } from './pages/borrowed-by-user/borrowed-by-user';
import { LentByUser } from './pages/lent-by-user/lent-by-user';
import { BorrowingDetails } from './pages/borrowing-details/borrowing-details';

const routes: Routes = [
  { path: 'borrowed-by/:userId', component: BorrowedByUser },
  { path: 'lent-by/:userId', component: LentByUser },
  { path: ':id', component: BorrowingDetails }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BorrowingsRoutingModule {}
