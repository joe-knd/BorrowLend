import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared-module';
import { RatingsRoutingModule } from './ratings-routing-module';

import { RateUser } from './pages/rate-user/rate-user';
import { UserRatings } from './pages/user-ratings/user-ratings';

@NgModule({
  declarations: [
    RateUser,
    UserRatings],
  imports: [
    CommonModule,
    RatingsRoutingModule,
    SharedModule,
    ReactiveFormsModule],
})
export class RatingsModule {}
