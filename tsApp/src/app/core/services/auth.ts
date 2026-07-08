import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly storageKey = 'currentUserId';
  private readonly userIdSignal = signal<string | null>(this.normalizeUserId(localStorage.getItem(this.storageKey)));

  currentUserId(): string | null {
    const normalized = this.normalizeUserId(this.userIdSignal());
    if (normalized !== this.userIdSignal()) {
      this.userIdSignal.set(normalized);
      if (normalized) {
        localStorage.setItem(this.storageKey, normalized);
      } else {
        localStorage.removeItem(this.storageKey);
      }
    }

    return normalized;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserId();
  }

  signIn(userId: string): void {
    const normalized = this.normalizeUserId(userId);
    if (!normalized) {
      return;
    }

    localStorage.setItem(this.storageKey, normalized);
    this.userIdSignal.set(normalized);
  }

  signOut(): void {
    localStorage.removeItem(this.storageKey);
    this.userIdSignal.set(null);
  }

  private normalizeUserId(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim().replace(/^"|"$/g, '');
    return trimmed.length > 0 ? trimmed : null;
  }
}
