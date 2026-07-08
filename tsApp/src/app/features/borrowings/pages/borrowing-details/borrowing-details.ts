import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-borrowing-details',
  standalone: false,
  templateUrl: './borrowing-details.html',
  styleUrl: './borrowing-details.css',
})
export class BorrowingDetails {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      itemId: ['', Validators.required],
      borrowerId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
    });
  }

  submit() {
    if (this.form.valid) {
      console.log('Borrow item:', this.form.value);
    }
  }
}
