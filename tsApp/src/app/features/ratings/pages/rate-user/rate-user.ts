import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rate-user',
  standalone: false,
  templateUrl: './rate-user.html',
  styleUrl: './rate-user.css',
})
export class RateUser {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      userId: ['', Validators.required],
      score: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
    });
  }

  submit() {
    if (this.form.valid) {
      console.log('Rate user:', this.form.value);
    }
  }
}
