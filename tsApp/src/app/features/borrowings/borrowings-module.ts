import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared-module';
import { BorrowingsRoutingModule } from './borrowings-routing-module';

import { BorrowedByUser } from './pages/borrowed-by-user/borrowed-by-user';
import { LentByUser } from './pages/lent-by-user/lent-by-user';
import { BorrowingDetails } from './pages/borrowing-details/borrowing-details';

@NgModule({
  declarations: [
    BorrowedByUser,
    LentByUser,
    BorrowingDetails],
  imports: [
    CommonModule,
    BorrowingsRoutingModule,
    SharedModule,
    ReactiveFormsModule],
})
export class BorrowingsModule {}
