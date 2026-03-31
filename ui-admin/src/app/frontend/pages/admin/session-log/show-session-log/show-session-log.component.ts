import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionLogPayload } from 'src/app/backend/payloads/admin/session-log-payload';

@Component({
  selector: 'vex-show-session-log',
  standalone: true,
  templateUrl: './show-session-log.component.html',
  styleUrl: './show-session-log.component.scss',
  imports: [CommonModule, NgIf, MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule]
})
export class ShowSessionLogComponent {
  element: SessionLogPayload;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { element: SessionLogPayload },
    private dialogRef: MatDialogRef<ShowSessionLogComponent>
  ) {
    this.element = data.element;
  }

  close() {
    this.dialogRef.close();
  }
}
