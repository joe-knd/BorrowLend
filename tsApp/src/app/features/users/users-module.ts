import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared-module';
import { UsersRoutingModule } from './users-routing-module';

import { Register } from './pages/register/register';
import { UserDetails } from './pages/user-details/user-details';
import { SignIn } from './pages/sign-in/sign-in';
import { EditUser } from './pages/edit-user/edit-user';
import { AuthLanding } from './pages/auth-landing/auth-landing';

@NgModule({
  declarations: [
    AuthLanding,
    SignIn,
    Register,
    UserDetails,
    EditUser,
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ],
})
export class UsersModule {}
