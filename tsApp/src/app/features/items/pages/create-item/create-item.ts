import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { Items } from '../../../../core/services/items';
import { Auth } from '../../../../core/services/auth';
import { Item } from '../../../../shared/models/item.model';

@Component({
  selector: 'app-create-item',
  standalone: false,
  templateUrl: './create-item.html',
  styleUrl: './create-item.css',
})
export class CreateItem {
  private itemsService = inject(Items);
  private auth = inject(Auth);
  private readonly maxImageSizeBytes = 5 * 1024 * 1024;
  private readonly allowedImageTypes = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]);

  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  savedItem: Item | null = null;
  selectedImageFile: File | null = null;
  selectedImagePreviewUrl: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      image: [null],
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.errorMessage = '';
    this.savedItem = null;

    if (!file) {
      this.selectedImageFile = null;
      this.selectedImagePreviewUrl = null;
      return;
    }

    if (!this.allowedImageTypes.has(file.type)) {
      this.selectedImageFile = null;
      this.selectedImagePreviewUrl = null;
      input.value = '';
      this.errorMessage = 'Invalid image format. Supported: jpg, jpeg, png, gif, webp.';
      return;
    }

    if (file.size > this.maxImageSizeBytes) {
      this.selectedImageFile = null;
      this.selectedImagePreviewUrl = null;
      input.value = '';
      this.errorMessage = 'Image file is too large. Maximum allowed size is 5MB.';
      return;
    }

    this.selectedImageFile = file;

    this.selectedImagePreviewUrl = URL.createObjectURL(file);
  }

  submit() {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    const userId = this.auth.currentUserId();
    if (!userId) {
      this.errorMessage = 'You must be signed in to create an item.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;
    this.savedItem = null;

    const raw = this.form.getRawValue();
    const formData = new FormData();
    formData.append('name', raw.name ?? '');
    formData.append('description', raw.description ?? '');
    formData.append('ownerId', userId);

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    this.itemsService.createItem(formData).subscribe({
      next: item => {
        this.isSubmitting = false;
        this.savedItem = item;
        this.form.reset();
        this.selectedImageFile = null;
        this.selectedImagePreviewUrl = null;
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Could not create item. Please verify details and try again.';
      }
    });
  }
}
