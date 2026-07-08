import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Users } from '../../../../core/services/users';
import { confirmPasswordValidator } from '../../../../shared/validators/confirm-password.validator';
import { passwordValidator } from '../../../../shared/validators/password.validator';

@Component({
  selector: 'app-edit-user',
  standalone: false,
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private users = inject(Users);
  private router = inject(Router);

  userId = this.route.snapshot.paramMap.get('id')!;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    password: ['', [Validators.required, passwordValidator]],
    confirmPassword: ['', Validators.required],
  }, { validators: confirmPasswordValidator });

  submit() {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    const raw = this.form.getRawValue();
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    this.users.changePassword(this.userId, {
      currentPassword: raw.currentPassword ?? '',
      newPassword: raw.password ?? ''
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Password updated successfully.';
        this.form.reset();
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Could not update password. Verify your current password and try again.';
      }
    });
  }

  backToProfile() {
    this.router.navigate(['/users', this.userId]);
  }
}
