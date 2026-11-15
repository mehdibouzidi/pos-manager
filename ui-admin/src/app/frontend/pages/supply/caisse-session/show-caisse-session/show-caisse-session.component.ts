import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CaisseSessionPayload } from 'src/app/backend/payloads/business/caisse-session-payload';
import { SalePayload } from 'src/app/backend/payloads/business/sale-payload';
import { CaisseSessionService } from 'src/app/backend/service/business/caisse-session.service';

interface ProductSummary {
  name: string;
  code: string;
  quantity: number;
  amount: number;
}

@Component({
  selector: 'vex-show-caisse-session',
  standalone: true,
  templateUrl: './show-caisse-session.component.html',
  styleUrl: './show-caisse-session.component.scss',
  imports: [CommonModule, NgIf, NgClass, MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule]
})
export class ShowCaisseSessionComponent implements OnInit {
  element: CaisseSessionPayload;

  sales: SalePayload[] = [];
  products: ProductSummary[] = [];
  loadingSales = true;
  salesError: string | null = null;

  /** Live totals computed from the sales (the stored totals of an open session are only set at closing). */
  salesCount = 0;
  salesTotal = 0;
  itemsCount = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { element: CaisseSessionPayload },
    private dialogRef: MatDialogRef<ShowCaisseSessionComponent>,
    private service: CaisseSessionService
  ) {
    this.element = data.element;
  }

  ngOnInit(): void {
    this.service.findSales(this.element.id).subscribe({
      next: (sales) => {
        this.sales = sales ?? [];
        this.computeSummary();
        this.loadingSales = false;
      },
      error: (err) => {
        this.salesError = err?.error?.message ?? 'Impossible de charger les ventes de cette caisse.';
        this.loadingSales = false;
      }
    });
  }

  private computeSummary(): void {
    this.salesCount = this.sales.length;
    this.salesTotal = this.sales.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0);
    const byProduct = new Map<string, ProductSummary>();
    for (const sale of this.sales) {
      for (const item of sale.items ?? []) {
        const key = String(item.productId ?? item.productName);
        const p = byProduct.get(key) ?? { name: item.productName ?? '—', code: item.productCode, quantity: 0, amount: 0 };
        p.quantity += item.quantity ?? 0;
        p.amount += item.totalPrice ?? (item.quantity ?? 0) * (item.unitPrice ?? 0);
        byProduct.set(key, p);
      }
    }
    this.products = [...byProduct.values()].sort((a, b) => b.amount - a.amount);
    this.itemsCount = this.products.reduce((sum, p) => sum + p.quantity, 0);
  }

  get averageBasket(): number {
    return this.salesCount ? this.salesTotal / this.salesCount : 0;
  }

  get expectedBalance(): number {
    return (this.element.openingBalance ?? 0) + this.salesTotal;
  }

  /** "Burger ×2, Coca ×1" */
  itemsLabel(sale: SalePayload): string {
    return (sale.items ?? []).map(i => `${i.productName} ×${i.quantity}`).join(', ');
  }

  /** "2026-10-27 14:27:14" → "27/10/2026 14:27" (the API sends local Algiers time). */
  shortDate(value: string): string {
    const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : '—';
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
