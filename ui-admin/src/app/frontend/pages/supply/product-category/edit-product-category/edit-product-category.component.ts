import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ProductCategoryPayload } from 'src/app/backend/payloads/business/product-category-payload';
import { ProductCategoryService } from 'src/app/backend/service/business/product-category.service';

@Component({
  selector: 'vex-edit-product-category',
  standalone: true,
  templateUrl: './edit-product-category.component.html',
  styleUrl: './edit-product-category.component.scss',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    NgIf,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatCommonModule,
    CommonModule
  ]
})
export class EditProductCategoryComponent {
  generalForm: FormGroup;
  payload = new ProductCategoryPayload();
  photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditProductCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private service: ProductCategoryService
  ) {
    this.payload = this.data.element;
    if (this.payload.photo) {
      this.photoPreview = 'data:image/jpeg;base64,' + this.payload.photo;
    }
    this.service.get(this.payload.id).subscribe({
      next: (response: ProductCategoryPayload) => {
        if (response != null) {
          this.payload = response;
          if (this.payload.photo) {
            this.photoPreview = 'data:image/jpeg;base64,' + this.payload.photo;
          }
          this.initForm();
        }
      }
    });
    this.initForm();
  }

  get f() { return this.generalForm.controls; }

  close(): void {
    this.dialogRef.close();
  }

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.payload.photo = result.split(',')[1];
        this.photoPreview = result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  edit(): void {
    this.payload.name = this.f['name'].value;
    this.payload.code = this.f['code'].value;
    this.service.update(this.payload).subscribe({
      next: (response: ProductCategoryPayload) => {
        if (response != null) {
          this.dialogRef.close();
        }
      },
      error: () => {}
    });
  }

  initForm() {
    this.generalForm = this.fb.group({
      name: [this.payload.name, [Validators.required, Validators.maxLength(100)]],
      code: [this.payload.code, [Validators.required, Validators.maxLength(30)]]
    });
  }
}
