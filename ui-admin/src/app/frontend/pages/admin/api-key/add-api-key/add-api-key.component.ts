import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiKeyPayload } from 'src/app/backend/payloads/admin/api-key-payload';
import { ApiKeyService } from 'src/app/backend/service/admin/api-key.service';

@Component({
  selector: 'vex-add-api-key',
  standalone: true,
  templateUrl: './add-api-key.component.html',
  styleUrl: './add-api-key.component.scss',
  imports: [
    ReactiveFormsModule, MatDialogModule, NgIf, MatButtonModule,
    MatIconModule, MatDividerModule, MatFormFieldModule,
    MatInputModule, MatCommonModule, CommonModule, MatSlideToggleModule
  ]
})
export class AddApiKeyComponent {
  generalForm: FormGroup;
  payload = new ApiKeyPayload();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddApiKeyComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private service: ApiKeyService
  ) {
    this.initForm();
  }

  get f() { return this.generalForm.controls; }

  close(): void { this.dialogRef.close(); }

  add(): void {
    if (this.generalForm.invalid) return;
    this.payload.description = this.f['description'].value;
    this.payload.active = this.f['active'].value;
    this.service.add(this.payload).subscribe({
      next: (response: ApiKeyPayload) => {
        if (response != null) this.dialogRef.close();
      },
      error: () => {}
    });
  }

  initForm() {
    this.generalForm = this.fb.group({
      description: [this.payload.description, [Validators.required, Validators.maxLength(200)]],
      active: [this.payload.active]
    });
  }
}
