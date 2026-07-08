import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users-module').then(m => m.UsersModule)
  },
  {
    path: 'items',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/items/items-module').then(m => m.ItemsModule)
  },
  {
    path: 'borrowings',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/borrowings/borrowings-module').then(m => m.BorrowingsModule)
  },
  {
    path: 'ratings',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/ratings/ratings-module').then(m => m.RatingsModule)
  },
  {
    path: '',
    redirectTo: 'users/auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'users/auth'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
