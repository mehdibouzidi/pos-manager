import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  selector: 'vex-show-product-category',
  standalone: true,
  templateUrl: './show-product-category.component.html',
  styleUrl: './show-product-category.component.scss',
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
export class ShowProductCategoryComponent {
  generalForm: FormGroup;
  payload = new ProductCategoryPayload();
  photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ShowProductCategoryComponent>,
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

  close(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.generalForm = this.fb.group({
      name: [{ value: this.payload.name, disabled: true }],
      code: [{ value: this.payload.code, disabled: true }]
    });
  }
}
