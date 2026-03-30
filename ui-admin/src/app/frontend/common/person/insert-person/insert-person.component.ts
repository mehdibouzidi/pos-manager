import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { InsertAddressComponent } from '../../insert-address/insert-address.component';

@Component({
  selector: 'app-insert-person',
  templateUrl: './insert-person.component.html',
  styleUrls: ['./insert-person.component.css'],
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
    CommonModule,
    InsertAddressComponent,
    FormsModule
  ]
})
export class InsertPersonComponent implements OnInit, OnChanges {

  @Input() parentForm!: FormGroup;
  @Input() person!: any;

  private personFormGroup!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const disabled = !!this.person?.disableDisplay;

    this.personFormGroup = this.fb.group({
      firstName: [
        { value: this.person?.firstName ?? '', disabled },
        Validators.required
      ],
      lastName: [
        { value: this.person?.lastName ?? '', disabled },
        Validators.required
      ],
      phoneNumber: [
        { value: this.person?.phoneNumber ?? '', disabled },
        Validators.required
      ],
      email: [{ value: this.person?.email ?? '', disabled }]
    });

    if (this.parentForm.contains('person')) {
      this.parentForm.setControl('person', this.personFormGroup);
    } else {
      this.parentForm.addControl('person', this.personFormGroup);
    }

    this.applyPersonToForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['person'] && !changes['person'].firstChange) {
      this.applyPersonToForm();
    }
  }

  get personForm(): FormGroup {
    return this.personFormGroup ?? (this.parentForm.get('person') as FormGroup);
  }

  private applyPersonToForm(): void {
    if (!this.personFormGroup) {
      return;
    }

    const disabled = !!this.person?.disableDisplay;
    if (disabled) {
      this.personFormGroup.disable({ emitEvent: false });
    } else {
      this.personFormGroup.enable({ emitEvent: false });
    }

    this.personFormGroup.patchValue(
      {
        firstName: this.person?.firstName ?? '',
        lastName: this.person?.lastName ?? '',
        phoneNumber: this.person?.phoneNumber ?? '',
        email: this.person?.email ?? ''
      },
      { emitEvent: false }
    );
  }
}
