import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { PrivilegePayload } from 'src/app/backend/payloads/admin/privilegepayload';
import { PrivilegeService } from 'src/app/backend/service/admin/privilege.service';

@Component({
  selector: 'vex-edit-privilege',
  standalone: true,
  templateUrl: './edit-privilege.component.html',
  styleUrl: './edit-privilege.component.scss',
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
export class EditPrivilegeComponent {
generalForm: FormGroup;

  payload = new PrivilegePayload();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditPrivilegeComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private service: PrivilegeService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.payload.name = this.f['name'].value;
    this.payload.code = this.f['code'].value;

    this.service.update(this.payload).subscribe({
      next: (response: PrivilegePayload) => {
        if (response != null) {
          console.log('Privilege Added');
          this.dialogRef.close();
        }
      },
      error: () => {}
    });
  }

  ngOnInit(): void {
    this.payload = this.data.element;
    this.generalForm = this.fb.group({
      name: [
        this.payload.name,
        [Validators.required, Validators.maxLength(100)]
      ],
      code: [this.payload.code, [Validators.required, Validators.maxLength(30)]]
    });
  }

  get f() {
    return this.generalForm.controls;
  }
}
