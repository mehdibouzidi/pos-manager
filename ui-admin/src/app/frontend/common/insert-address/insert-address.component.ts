import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { AddressPayload } from 'src/app/backend/payloads/business/addresspayload';

interface AddressHolder {
  address?: AddressPayload;
  disableDisplay?: boolean;
}

@Component({
  selector: 'app-insert-address',
  templateUrl: './insert-address.component.html',
  styleUrls: ['./insert-address.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDialogModule,
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
export class InsertAddressComponent implements OnInit, OnChanges {
  @Input() supplier: AddressHolder = {};
  @Input() parentForm!: FormGroup;
  addressFormGroup!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplier'] && !changes['supplier'].firstChange) {
      if (!this.addressFormGroup) {
        this.initializeForm();
        return;
      }
      this.applySupplierToForm();
    }
  }

  get addressForm(): FormGroup {
    return this.parentForm.get('address') as FormGroup;
  }

  private initializeForm(): void {
    const address = this.resolveAddress();
    const disabled = this.supplier?.disableDisplay ?? false;

    this.addressFormGroup = this.fb.group({
      address: [{ value: address.address ?? '', disabled }],
      city: [{ value: address.city ?? '', disabled }],
      town: [{ value: address.town ?? '', disabled }],
      postalCode: [{ value: address.postalCode ?? '', disabled }]
    });

    if (this.parentForm.contains('address')) {
      this.parentForm.setControl('address', this.addressFormGroup);
    } else {
      this.parentForm.addControl('address', this.addressFormGroup);
    }
  }

  private applySupplierToForm(): void {
    const address = this.resolveAddress();
    const disabled = this.supplier?.disableDisplay ?? false;

    if (disabled) {
      this.addressFormGroup.disable({ emitEvent: false });
    } else {
      this.addressFormGroup.enable({ emitEvent: false });
    }

    this.addressFormGroup.patchValue(
      {
        address: address.address ?? '',
        city: address.city ?? '',
        town: address.town ?? '',
        postalCode: address.postalCode ?? ''
      },
      { emitEvent: false }
    );
  }

  private resolveAddress(): AddressPayload {
    if (this.supplier?.address) {
      return Object.assign(new AddressPayload(), this.supplier.address);
    }
    return new AddressPayload();
  }
}
