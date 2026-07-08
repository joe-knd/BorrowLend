import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Users } from '../../../../core/services/users';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-sign-in',
  standalone: false,
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private fb = inject(FormBuilder);
  private users = inject(Users);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);

  isSubmitting = false;
  errorMessage = '';

  readonly justRegistered = this.route.snapshot.queryParamMap.get('registered') === '1';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit() {
    const currentUserId = this.auth.currentUserId();
    if (currentUserId) {
      this.router.navigate(['/borrowings/borrowed-by', currentUserId]);
    }
  }

  submit() {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    const raw = this.form.getRawValue();
    this.errorMessage = '';
    this.isSubmitting = true;

    this.users.login({
      email: raw.email ?? '',
      password: raw.password ?? ''
    }).subscribe({
      next: (response: any) => {
        const userId = this.extractUserId(response);
        if (!userId) {
          this.isSubmitting = false;
          this.errorMessage = 'Login succeeded but user id was not returned by API.';
          return;
        }

        this.isSubmitting = false;
        this.auth.signIn(userId);
        this.router.navigate(['/borrowings/borrowed-by', userId]);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Invalid email or password.';
      }
    });
  }

  private extractUserId(response: any): string | null {
    const candidates = [
      response?.id,
      response?.userId,
      response?.user?.id,
      this.extractUserIdFromJwt(response?.token),
      this.extractUserIdFromJwt(response?.accessToken)
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }

    return null;
  }

  private extractUserIdFromJwt(token: string | undefined): string | null {
    if (!token || token.split('.').length < 2) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.sub ?? payload?.nameid ?? null;
    } catch {
      return null;
    }
  }
}
