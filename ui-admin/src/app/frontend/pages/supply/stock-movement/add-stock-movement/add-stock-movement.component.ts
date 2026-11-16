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
import { AutocompleteOption, AutocompleteSelectComponent } from 'src/app/frontend/common/autocomplete-select/autocomplete-select.component';
import { MatOptionModule } from '@angular/material/core';
import { StockMovementPayload } from 'src/app/backend/payloads/business/stock-movement-payload';
import { StockMovementService } from 'src/app/backend/service/business/stock-movement.service';
import { ProductPayload } from 'src/app/backend/payloads/business/productpayload';
import { ProductService } from 'src/app/backend/service/business/product.service';
import { PosPayload } from 'src/app/backend/payloads/admin/pospayload';
import { PosService } from 'src/app/backend/service/admin/pos.service';
import { UtilStatic } from 'src/app/backend/service/util/UtilStatic';

@Component({
  selector: 'vex-add-stock-movement',
  standalone: true,
  templateUrl: './add-stock-movement.component.html',
  styleUrl: './add-stock-movement.component.scss',
  imports: [
    ReactiveFormsModule, MatDialogModule, NgIf, NgFor, MatButtonModule,
    MatIconModule, MatDividerModule, MatFormFieldModule, MatInputModule,
    MatCommonModule, MatSelectModule, MatOptionModule, CommonModule, AutocompleteSelectComponent
  ]
})
export class AddStockMovementComponent implements OnInit {
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
    public dialogRef: MatDialogRef<AddStockMovementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: StockMovementService,
    private productService: ProductService,
    private posService: PosService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadPoses();
    this.initForm();
    this.generalForm.get('productId')!.valueChanges.subscribe(() => this.updateQuantityValidator());
    this.generalForm.get('movementType')!.valueChanges.subscribe(() => this.updateQuantityValidator());
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

  get selectedProduct(): ProductPayload | null {
    const id = this.f['productId'].value;
    return this.products.find(p => p.id === id) ?? null;
  }

  updateQuantityValidator(): void {
    const quantityCtrl = this.generalForm.get('quantity')!;
    const type = this.f['movementType'].value;
    const product = this.selectedProduct;
    const validators = [Validators.required, Validators.min(0.01)];
    if (type === 'LOSS' && product) {
      validators.push(Validators.max(product.currentStock));
    }
    quantityCtrl.setValidators(validators);
    quantityCtrl.updateValueAndValidity();
  }

  close(): void {
    this.dialogRef.close();
  }

  add(): void {
    if (this.generalForm.invalid) return;
    this.payload.posId = this.f['posId'].value;
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
      posId: [{ value: Number(localStorage.getItem(UtilStatic.STORE_ID)) || null, disabled: !this.superAdmin }, [Validators.required]],
      productId: [null, [Validators.required]],
      movementType: ['', [Validators.required]],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      reason: ['', [Validators.maxLength(255)]]
    });
  }
}
