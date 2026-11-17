import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';
import { SaleCriteria } from 'src/app/backend/criteria/business/sale-criteria';
import { SalePayload } from 'src/app/backend/payloads/business/sale-payload';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { SaleService } from 'src/app/backend/service/business/sale.service';
import { AuditCellComponent } from 'src/app/frontend/common/audit-cell/audit-cell.component';

/** Filters shared with the "Par produit" view of the Ventes page. */
export interface SaleTicketFilters {
  productId: number | null;
  categoryId: number | null;
  fromDate: string | null;
  toDate: string | null;
  caisseSessionId: number | null;
  orderType: string | null;
}

const ORDER_TYPE_LABELS: Record<string, string> = { DINE_IN: 'À table', TAKEAWAY: 'À emporter' };

/** Ventes page, "Par ticket" view: one row per ticket with its lines. */
@Component({
  selector: 'vex-sale-tickets',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DecimalPipe, MatTableModule, MatSortModule, MatPaginatorModule,
    MatProgressBarModule, MatTooltipModule, AuditCellComponent],
  template: `
    <mat-progress-bar *ngIf="isLoading" mode="indeterminate" color="primary"></mat-progress-bar>

    <table [dataSource]="tickets" class="w-full" mat-table matSort matSortActive="saleDate" matSortDirection="desc"
           (matSortChange)="onSort($event)">

      <ng-container matColumnDef="orderNumber">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Ticket</th>
        <td mat-cell *matCellDef="let t" class="whitespace-nowrap">
          <span class="font-semibold">#{{ t.orderNumber }}</span>
          <span *ngIf="t.localOrderNumber && t.localOrderNumber !== t.orderNumber"
                class="block text-xs text-secondary"
                matTooltip="Numéro imprimé sur le ticket (vente faite hors ligne)">imprimé #{{ t.localOrderNumber }}</span>
        </td>
      </ng-container>

      <ng-container matColumnDef="saleDate">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
        <td mat-cell *matCellDef="let t" class="whitespace-nowrap">{{ shortDate(t.saleDate) }}</td>
      </ng-container>

      <ng-container matColumnDef="orderType">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
        <td mat-cell *matCellDef="let t">
          <span *ngIf="t.orderType; else noType" class="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                [ngClass]="t.orderType === 'TAKEAWAY' ? 'text-amber-700 bg-amber-50' : 'text-sky-700 bg-sky-50'">
            {{ orderTypeLabel(t.orderType) }}
          </span>
          <ng-template #noType><span class="text-secondary">—</span></ng-template>
        </td>
      </ng-container>

      <ng-container matColumnDef="items">
        <th mat-header-cell *matHeaderCellDef>Articles</th>
        <td mat-cell *matCellDef="let t">
          <div *ngFor="let i of t.items" class="flex justify-between gap-4 leading-snug">
            <span>{{ i.productName }} <span class="text-secondary">× {{ i.quantity }}</span></span>
            <span class="text-secondary whitespace-nowrap">{{ i.totalPrice | number:'1.2-2' }} Da</span>
          </div>
        </td>
      </ng-container>

      <ng-container matColumnDef="totalAmount">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Total</th>
        <td mat-cell *matCellDef="let t" class="font-semibold whitespace-nowrap">{{ t.totalAmount | number:'1.2-2' }} Da</td>
      </ng-container>

      <ng-container matColumnDef="caisse">
        <th mat-header-cell *matHeaderCellDef>Caisse</th>
        <td mat-cell *matCellDef="let t">
          <div *ngIf="t.caisseSessionId; else noCaisse" class="leading-tight">
            <div class="flex items-center gap-2">
              <span class="font-medium whitespace-nowrap">Caisse #{{ t.caisseSessionId }}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                    [ngClass]="t.caisseSessionStatus === 'OPEN' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-100'">
                {{ t.caisseSessionStatus === 'OPEN' ? 'Ouverte' : 'Clôturée' }}
              </span>
            </div>
            <div class="text-xs text-secondary">{{ t.posName }}</div>
          </div>
          <ng-template #noCaisse><span class="text-secondary">—</span></ng-template>
        </td>
      </ng-container>

      <ng-container matColumnDef="seller">
        <th mat-header-cell *matHeaderCellDef>Vendeur</th>
        <td mat-cell *matCellDef="let t"><vex-audit-cell [name]="t.createdByFullName" [username]="t.createdByUsername"></vex-audit-cell></td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let t; columns: columns;"></tr>
    </table>

    <div *ngIf="!isLoading && !tickets.length" class="text-sm text-secondary text-center py-8">
      {{ error ?? 'Aucun ticket pour ces filtres.' }}
    </div>

    <div class="flex items-center justify-between flex-wrap gap-2 px-6 border-t">
      <span class="text-sm text-secondary py-3">
        {{ page.totalNumberOfElements ?? 0 }} ticket{{ (page.totalNumberOfElements ?? 0) > 1 ? 's' : '' }}
        <ng-container *ngIf="tickets.length">· total de la page {{ pageTotal | number:'1.2-2' }} Da</ng-container>
      </span>
      <mat-paginator [pageSizeOptions]="[10, 20, 50]" [pageSize]="criteria.size" [pageIndex]="criteria.pages"
        [length]="page.totalNumberOfElements" (page)="onPage($event)" showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  // Same top line for every cell of a ticket, whatever its number of articles
  styles: [`td.mat-mdc-cell { vertical-align: top; padding-top: 12px; padding-bottom: 12px; }`]
})
export class SaleTicketsComponent implements OnChanges {
  @Input() filters: SaleTicketFilters;

  readonly columns = ['orderNumber', 'saleDate', 'orderType', 'items', 'totalAmount', 'caisse', 'seller'];

  criteria = new SaleCriteria();
  page = new GlobalPayload<SalePayload>();
  tickets: SalePayload[] = [];
  pageTotal = 0;
  isLoading = false;
  error: string | null = null;
  private request = 0;

  constructor(private saleService: SaleService) {}

  /** New filters from the page: back to the first page. */
  ngOnChanges(): void {
    Object.assign(this.criteria, this.filters ?? {});
    this.criteria.pages = 0;
    this.load();
  }

  onSort(sort: Sort): void {
    this.criteria.sortColumn = sort.direction ? sort.active : 'saleDate';
    this.criteria.sort = sort.direction ? sort.direction.toUpperCase() : 'DESC';
    this.criteria.pages = 0;
    this.load();
  }

  onPage(event: PageEvent): void {
    this.criteria.pages = event.pageIndex;
    this.criteria.size = event.pageSize;
    this.load();
  }

  orderTypeLabel(type: string): string {
    return ORDER_TYPE_LABELS[type] ?? type;
  }

  /** "2026-10-27 14:27:14" → "27/10/2026 14:27" */
  shortDate(value: string): string {
    const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : '—';
  }

  private load(): void {
    // Filters can change while a request is running: only the latest answer is shown
    const request = ++this.request;
    this.isLoading = true;
    this.error = null;
    this.saleService.findAllByCriteria(this.criteria)
      .pipe(finalize(() => { if (request === this.request) this.isLoading = false; }))
      .subscribe({
        next: (page) => {
          if (request !== this.request) return;
          this.page = page ?? new GlobalPayload<SalePayload>();
          this.tickets = this.page.elements ?? [];
          this.pageTotal = this.tickets.reduce((sum, t) => sum + (t.totalAmount ?? 0), 0);
        },
        error: () => {
          if (request !== this.request) return;
          this.tickets = [];
          this.error = 'Impossible de charger les tickets.';
        }
      });
  }
}
