import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
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
import { ProductPayload } from 'src/app/backend/payloads/business/productpayload';
import { ProductService } from 'src/app/backend/service/business/product.service';

@Component({
  selector: 'vex-show-product',
  standalone: true,
  templateUrl: './show-product.component.html',
  styleUrl: './show-product.component.scss',
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
    CommonModule
  ]
})
export class ShowProductComponent {
  generalForm: FormGroup;

  payload = new ProductPayload();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ShowProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private service: ProductService
  ) {
    this.payload = this.data.element;
    this.service.get(this.payload.id).subscribe({
      next: (response: ProductPayload) => {
        if (response != null) {
          this.payload = response;}
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }



  initData(){
    // Data is loaded from payload - no external service calls needed
  }

  initForm(){
    this.generalForm = this.fb.group({
      name: [
        {value: this.payload.name, disabled: true},
        [Validators.required, Validators.maxLength(30)],
      ],
      code: [
        {value: this.payload.code, disabled: true},
        [Validators.required, Validators.maxLength(30)],
      ],
      maxStock: [
        {value: this.payload.maxStock, disabled: true},
      ],
      minStock: [
        {value: this.payload.minStock, disabled: true},
      ],
      wholesalePrice: [
        {value: this.payload.wholesalePrice, disabled: true},
      ],
      retailPrice: [
        {value: this.payload.retailPrice, disabled: true},
      ]
    });
  }

  initObservables(){
    // Observables not needed for show mode
  }

  ngOnInit(): void {
    this.initData();
    this.initForm();
    this.initObservables();
  }

  get f() {
    return this.generalForm.controls;
  }
}
