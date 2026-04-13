import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CaisseSessionPayload } from 'src/app/backend/payloads/business/caisse-session-payload';

@Component({
  selector: 'vex-show-caisse-session',
  standalone: true,
  templateUrl: './show-caisse-session.component.html',
  styleUrl: './show-caisse-session.component.scss',
  imports: [CommonModule, NgIf, NgClass, MatDialogModule, MatButtonModule, MatIconModule]
})
export class ShowCaisseSessionComponent {
  element: CaisseSessionPayload;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { element: CaisseSessionPayload },
    private dialogRef: MatDialogRef<ShowCaisseSessionComponent>
  ) {
    this.element = data.element;
  }

  close() {
    this.dialogRef.close();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'OPEN': return 'Ouverte';
      case 'CLOSED': return 'Clôturée';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'text-green-600 bg-green-50';
      case 'CLOSED': return 'text-gray-600 bg-gray-100';
      default: return '';
    }
  }

  getVarianceClass(variance: number): string {
    if (variance == null) return '';
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  }
}
