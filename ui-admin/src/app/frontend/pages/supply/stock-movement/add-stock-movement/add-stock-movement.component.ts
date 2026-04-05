import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { StockMovementPayload } from 'src/app/backend/payloads/business/stock-movement-payload';
import { StockMovementService } from 'src/app/backend/service/business/stock-movement.service';
import { ProductPayload } from 'src/app/backend/payloads/business/productpayload';
import { ProductService } from 'src/app/backend/service/business/product.service';

@Component({
  selector: 'vex-add-stock-movement',
  standalone: true,
  templateUrl: './add-stock-movement.component.html',
  styleUrl: './add-stock-movement.component.scss',
  imports: [
    ReactiveFormsModule, MatDialogModule, NgIf, NgFor, MatButtonModule,
    MatIconModule, MatDividerModule, MatFormFieldModule, MatInputModule,
    MatCommonModule, MatSelectModule, MatOptionModule, CommonModule
  ]
})
export class AddStockMovementComponent implements OnInit {
  generalForm: FormGroup;
  payload = new StockMovementPayload();
  products: ProductPayload[] = [];

  movementTypes = [
    { value: 'ENTRY', label: 'Entrée' },
    { value: 'LOSS', label: 'Perte' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddStockMovementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: StockMovementService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.initForm();
  }

  loadProducts() {
    this.productService.findAll().subscribe({
      next: (response: any) => {
        this.products = response || [];
      },
      error: () => {}
    });
  }

  get f() { return this.generalForm.controls; }

  close(): void {
    this.dialogRef.close();
  }

  add(): void {
    if (this.generalForm.invalid) return;
    this.payload.productId = this.f['productId'].value;
    this.payload.movementType = this.f['movementType'].value;
    this.payload.quantity = this.f['quantity'].value;
    this.payload.reason = this.f['reason'].value;
    this.service.add(this.payload).subscribe({
      next: (response: StockMovementPayload) => {
        if (response != null) {
          this.dialogRef.close();
        }
      },
      error: () => {}
    });
  }

  initForm() {
    this.generalForm = this.fb.group({
      productId: [null, [Validators.required]],
      movementType: ['', [Validators.required]],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      reason: ['', [Validators.maxLength(255)]]
    });
  }
}
