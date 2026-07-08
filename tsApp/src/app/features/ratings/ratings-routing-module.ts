import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RateUser } from './pages/rate-user/rate-user';
import { UserRatings } from './pages/user-ratings/user-ratings';

const routes: Routes = [
  { path: 'rate/:userId', component: RateUser },
  { path: 'user/:userId', component: UserRatings }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RatingsRoutingModule {}
