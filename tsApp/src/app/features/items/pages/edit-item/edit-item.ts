import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Items } from '../../../../core/services/items';
import { Item } from '../../../../shared/models/item.model';

@Component({
  selector: 'app-edit-item',
  standalone: false,
  templateUrl: './edit-item.html',
  styleUrl: './edit-item.css',
})
export class EditItem {
  private route = inject(ActivatedRoute);
  private itemsService = inject(Items);
  private readonly maxImageSizeBytes = 5 * 1024 * 1024;
  private readonly allowedImageTypes = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]);

  itemId = Number(this.route.snapshot.paramMap.get('id'));
  form: FormGroup;
  isSubmitting = false;
  isLoading = false;
  errorMessage = '';
  savedItem: Item | null = null;
  currentImageUrl: string | null = null;
  selectedImageFile: File | null = null;
  selectedImagePreviewUrl: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      image: [null],
    });
  }

  ngOnInit(): void {
    this.loadItem();
  }

  loadItem(): void {
    if (!this.itemId) {
      this.errorMessage = 'Invalid item id.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.itemsService.getById(this.itemId).subscribe({
      next: item => {
        this.isLoading = false;
        this.form.patchValue({
          name: item.name,
          description: item.description ?? ''
        });
        this.currentImageUrl = item.imageUrl ?? null;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Could not load item details.';
      }
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
    if (this.form.invalid || this.isSubmitting || !this.itemId) {
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;
    this.savedItem = null;

    const raw = this.form.getRawValue();
    const formData = new FormData();
    formData.append('name', raw.name ?? '');
    formData.append('description', raw.description ?? '');

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    this.itemsService.updateItem(this.itemId, formData).subscribe({
      next: item => {
        this.isSubmitting = false;
        this.savedItem = item;
        this.currentImageUrl = item.imageUrl ?? this.currentImageUrl;
        this.selectedImageFile = null;
        this.selectedImagePreviewUrl = null;
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Could not update item. Please verify details and try again.';
      }
    });
  }
}
