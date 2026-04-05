import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { ProductPayload } from 'src/app/backend/payloads/business/productpayload';
import { ProductCategoryPayload } from 'src/app/backend/payloads/business/product-category-payload';
import { ProductService } from 'src/app/backend/service/business/product.service';
import { ProductCategoryService } from 'src/app/backend/service/business/product-category.service';

@Component({
  selector: 'vex-edit-product',
  standalone: true,
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.scss',
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDialogModule,
    NgIf,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCommonModule,
    MatSelectModule,
    CommonModule
  ]
})
export class EditProductComponent {
  generalForm: FormGroup;

  payload = new ProductPayload();
  categories: ProductCategoryPayload[] = [];
  photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private service: ProductService,
    private categoryService: ProductCategoryService
  ) {
    this.payload = this.data.element;
  }

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.payload.name = this.f['name'].value;
    this.payload.code = this.f['code'].value;
    this.payload.maxStock = this.f['maxStock'].value;
    this.payload.minStock = this.f['minStock'].value;
    this.payload.retailPrice = this.f['retailPrice'].value;
    this.payload.categoryId = this.f['categoryId'].value;

    this.service.update(this.payload).subscribe({
      next: (response: ProductPayload) => {
        if (response != null) {
          this.dialogRef.close();
        }
      },
      error: () => {}
    });
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

  initData() {
    this.categoryService.findAll().subscribe({
      next: (res: any) => { this.categories = res as ProductCategoryPayload[]; }
    });
  }

  initForm() {
    this.generalForm = this.fb.group({
      name: [
        this.payload.name,
        [Validators.required, Validators.maxLength(30)]
      ],
      code: [
        this.payload.code,
        [Validators.required, Validators.maxLength(30)]
      ],
      maxStock: [this.payload.maxStock],
      minStock: [this.payload.minStock],
      retailPrice: [this.payload.retailPrice],
      categoryId: [this.payload.categoryId]
    });
  }

  initObservables() {}

  ngOnInit(): void {
    this.initData();
    this.initForm();
    this.service.get(this.payload.id).subscribe({
      next: (response: ProductPayload) => {
        if (response != null) {
          this.payload = response;
          if (this.payload.photo) {
            this.photoPreview = 'data:image/jpeg;base64,' + this.payload.photo;
          }
          this.generalForm.patchValue({
            name: this.payload.name,
            code: this.payload.code,
            maxStock: this.payload.maxStock,
            minStock: this.payload.minStock,
            retailPrice: this.payload.retailPrice,
            categoryId: this.payload.categoryId
          });
        }
      }
    });
  }

  get f() {
    return this.generalForm.controls;
  }
}
