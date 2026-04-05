import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule, MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StockMovementPayload } from 'src/app/backend/payloads/business/stock-movement-payload';
import { StockMovementService } from 'src/app/backend/service/business/stock-movement.service';
import { ProductPayload } from 'src/app/backend/payloads/business/productpayload';
import { ProductService } from 'src/app/backend/service/business/product.service';

@Component({
  selector: 'vex-edit-stock-movement',
  standalone: true,
  templateUrl: './edit-stock-movement.component.html',
  styleUrl: './edit-stock-movement.component.scss',
  imports: [
    ReactiveFormsModule, MatDialogModule, NgIf, NgFor, MatButtonModule,
    MatIconModule, MatDividerModule, MatFormFieldModule, MatInputModule,
    MatCommonModule, MatSelectModule, MatOptionModule, CommonModule
  ]
})
export class EditStockMovementComponent implements OnInit {
  generalForm: FormGroup;
  payload = new StockMovementPayload();
  products: ProductPayload[] = [];

  movementTypes = [
    { value: 'ENTRY', label: 'Entrée' },
    { value: 'LOSS', label: 'Perte' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditStockMovementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { element: StockMovementPayload },
    private service: StockMovementService,
    private productService: ProductService
  ) {
    this.payload = this.data.element;
  }

  ngOnInit(): void {
    this.loadProducts();
    this.service.get(this.payload.id).subscribe({
      next: (response: StockMovementPayload) => {
        if (response != null) {
          this.payload = response;
          this.initForm();
        }
      }
    });
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

  edit(): void {
    if (this.generalForm.invalid) return;
    this.payload.productId = this.f['productId'].value;
    this.payload.movementType = this.f['movementType'].value;
    this.payload.quantity = this.f['quantity'].value;
    this.payload.reason = this.f['reason'].value;
    this.service.update(this.payload).subscribe({
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
      productId: [this.payload.productId, [Validators.required]],
      movementType: [this.payload.movementType, [Validators.required]],
      quantity: [this.payload.quantity, [Validators.required, Validators.min(0.01)]],
      reason: [this.payload.reason, [Validators.maxLength(255)]]
    });
  }
}
