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
import { AutocompleteOption, AutocompleteSelectComponent } from 'src/app/frontend/common/autocomplete-select/autocomplete-select.component';
import { StockMovementPayload } from 'src/app/backend/payloads/business/stock-movement-payload';
import { StockMovementService } from 'src/app/backend/service/business/stock-movement.service';
import { ProductPayload } from 'src/app/backend/payloads/business/productpayload';
import { ProductService } from 'src/app/backend/service/business/product.service';
import { PosPayload } from 'src/app/backend/payloads/admin/pospayload';
import { PosService } from 'src/app/backend/service/admin/pos.service';
import { UtilStatic } from 'src/app/backend/service/util/UtilStatic';

@Component({
  selector: 'vex-edit-stock-movement',
  standalone: true,
  templateUrl: './edit-stock-movement.component.html',
  styleUrl: './edit-stock-movement.component.scss',
  imports: [
    ReactiveFormsModule, MatDialogModule, NgIf, NgFor, MatButtonModule,
    MatIconModule, MatDividerModule, MatFormFieldModule, MatInputModule,
    MatCommonModule, MatSelectModule, MatOptionModule, CommonModule, AutocompleteSelectComponent
  ]
})
export class EditStockMovementComponent implements OnInit {
  generalForm: FormGroup;
  payload = new StockMovementPayload();
  products: ProductPayload[] = [];
  productOptions: AutocompleteOption[] = [];
  posOptions: AutocompleteOption[] = [];
  /** Only a super admin chooses the POS; other users record movements for their own POS. */
  readonly superAdmin = localStorage.getItem(UtilStatic.SUPER_ADMIN) === 'true';

  movementTypes: AutocompleteOption[] = [
    { value: 'ENTRY', label: 'Entrée' },
    { value: 'LOSS', label: 'Perte' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditStockMovementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { element: StockMovementPayload },
    private service: StockMovementService,
    private productService: ProductService,
    private posService: PosService
  ) {
    this.payload = this.data.element;
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadPoses();
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

  /** The POS decides which till sees the stock: it is chosen on every movement. */
  loadPoses() {
    const ownId = Number(localStorage.getItem(UtilStatic.STORE_ID)) || null;
    if (!this.superAdmin) {
      const name = localStorage.getItem(UtilStatic.STORE_NAME) ?? '';
      const code = localStorage.getItem(UtilStatic.STORE_CODE) ?? '';
      this.posOptions = ownId ? [{ value: ownId, label: name || code, hint: code }] : [];
      return;
    }
    this.posService.findAll().subscribe({
      next: (response: any) => {
        this.posOptions = ((response || []) as PosPayload[])
          .filter(p => p.active || p.id === this.f['posId']?.value)
          .map(p => ({ value: p.id, label: p.name, hint: p.code, sublabel: p.code }));
      },
      error: () => {}
    });
  }

  loadProducts() {
    this.productService.findAll().subscribe({
      next: (response: any) => {
        this.products = response || [];
        this.productOptions = this.products.map(p => ({ value: p.id, label: p.name, hint: p.code }));
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
    this.payload.posId = this.f['posId'].value;
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
      posId: [{ value: this.payload.posId, disabled: !this.superAdmin }, [Validators.required]],
      productId: [this.payload.productId, [Validators.required]],
      movementType: [this.payload.movementType, [Validators.required]],
      quantity: [this.payload.quantity, [Validators.required, Validators.min(0.01)]],
      reason: [this.payload.reason, [Validators.maxLength(255)]]
    });
  }
}
