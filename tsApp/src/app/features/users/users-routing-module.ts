import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Register } from './pages/register/register';
import { UserDetails } from './pages/user-details/user-details';
import { SignIn } from './pages/sign-in/sign-in';
import { EditUser } from './pages/edit-user/edit-user';
import { AuthLanding } from './pages/auth-landing/auth-landing';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: 'auth', component: AuthLanding },
  { path: 'sign-in', component: SignIn },
  { path: 'register', component: Register },
  { path: ':id/edit-password', component: EditUser, canActivate: [authGuard] },
  { path: ':id', component: UserDetails, canActivate: [authGuard] }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
