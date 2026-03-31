import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { StockMovementPayload } from 'src/app/backend/payloads/business/stock-movement-payload';

@Component({
  selector: 'vex-show-stock-movement',
  standalone: true,
  templateUrl: './show-stock-movement.component.html',
  styleUrl: './show-stock-movement.component.scss',
  imports: [CommonModule, NgIf, MatDialogModule, MatButtonModule, MatIconModule]
})
export class ShowStockMovementComponent {
  element: StockMovementPayload;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { element: StockMovementPayload },
    private dialogRef: MatDialogRef<ShowStockMovementComponent>
  ) {
    this.element = data.element;
  }

  close() {
    this.dialogRef.close();
  }

  getMovementTypeLabel(type: string): string {
    switch (type) {
      case 'ENTRY': return 'Entrée';
      case 'EXIT': return 'Sortie';
      case 'ADJUSTMENT': return 'Ajustement';
      default: return type;
    }
  }

  getMovementTypeClass(type: string): string {
    switch (type) {
      case 'ENTRY': return 'text-green-600 bg-green-50';
      case 'EXIT': return 'text-red-600 bg-red-50';
      case 'ADJUSTMENT': return 'text-blue-600 bg-blue-50';
      default: return '';
    }
  }
}
