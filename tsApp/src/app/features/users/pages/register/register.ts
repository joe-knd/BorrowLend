import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Users } from '../../../../core/services/users';

import { passwordValidator } from '../../../../shared/validators/password.validator';
import { confirmPasswordValidator } from '../../../../shared/validators/confirm-password.validator';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private users = inject(Users);
  private router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordValidator]],
    confirmPassword: ['', Validators.required],
  }, { validators: confirmPasswordValidator });


  submit() {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    const raw = this.form.getRawValue();
    this.errorMessage = '';
    this.isSubmitting = true;

    this.users.register({
      firstName: raw.firstName ?? '',
      lastName: raw.lastName ?? '',
      email: raw.email ?? '',
      password: raw.password ?? ''
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.form.reset();
        this.router.navigate(['/users/sign-in'], {
          queryParams: { registered: '1' }
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Could not complete registration. Please verify your details and try again.';
      }
    });
  }
}
