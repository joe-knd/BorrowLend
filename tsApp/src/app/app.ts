import { Component, signal } from '@angular/core';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from './core/services/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly title = signal('BorrowLend');

  protected currentUserIdForDebug(): string {
    return this.auth.currentUserId() ?? 'not-signed-in';
  }

  protected goToBorrowedItems(): void {
    const userId = this.auth.currentUserId();
    if (userId) {
      this.router.navigate(['/borrowings/borrowed-by', userId]);
    }
  }

  protected signOut(): void {
    this.auth.signOut();
    this.router.navigate(['/users/auth']);
  }

  protected goToAvailableItems(): void {
    this.router.navigate(['/items/available']);
  }

  protected goToMyItems(): void {
    this.router.navigate(['/items']);
  }

  protected goToCreateItem(): void {
    this.router.navigate(['/items/create']);
  }
}
