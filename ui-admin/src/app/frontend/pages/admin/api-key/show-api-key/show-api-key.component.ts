import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ApiKeyPayload } from 'src/app/backend/payloads/admin/api-key-payload';

@Component({
  selector: 'vex-show-api-key',
  standalone: true,
  templateUrl: './show-api-key.component.html',
  styleUrl: './show-api-key.component.scss',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule, CommonModule]
})
export class ShowApiKeyComponent {
  payload: ApiKeyPayload;

  constructor(
    public dialogRef: MatDialogRef<ShowApiKeyComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.payload = this.data.element;
  }

  close(): void { this.dialogRef.close(); }
}
