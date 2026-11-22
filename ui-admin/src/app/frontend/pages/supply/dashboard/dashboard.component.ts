import { CommonModule, CurrencyPipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { VexChartComponent } from '@vex/components/vex-chart/vex-chart.component';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { DashboardService } from 'src/app/backend/service/business/dashboard.service';
import { ApexOptions } from '@vex/components/vex-chart/vex-chart.component';
import { DateRange, DateRangeFilterComponent } from 'src/app/frontend/common/date-range-filter/date-range-filter.component';

@Component({
  selector: 'vex-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexPageLayoutComponent,
    VexPageLayoutHeaderDirective,
    VexBreadcrumbsComponent,
    VexPageLayoutContentDirective,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatProgressBarModule,
    CommonModule,
    NgIf,
    NgFor,
    NgClass,
    DecimalPipe,
    CurrencyPipe,
    VexChartComponent,
    DateRangeFilterComponent
  ]
})
export class DashboardComponent implements OnInit {

  /** DAY, WEEK, MONTH, YEAR, ALL, or CUSTOM when a range is picked in the "Période" field. */
  period: string = 'MONTH';
  customFrom: string | null = null;
  customTo: string | null = null;
  loading = false;
  private request = 0;

  stats: any = null;

  // KPI cards
  kpiCards: { label: string; value: string; icon: string; colorClass: string; sublabel?: string }[] = [];

  // Charts
  historyChartOptions: ApexOptions = {};
  historyChartSeries: any[] = [];

  productChartOptions: ApexOptions = {};
  productChartSeries: any[] = [];

  // Top 3
  top3ByQuantity: any[] = [];
  top3ByMargin: any[] = [];

  // Table
  displayedColumns = ['productName', 'salesCount', 'salesQuantity', 'salesRevenue', 'entryValue', 'margin'];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // Period changed while a request was running: only the latest answer is shown
    const request = ++this.request;
    this.loading = true;
    const custom = this.period === 'CUSTOM';
    this.dashboardService.getStats(this.period, custom ? this.customFrom : null, custom ? this.customTo : null).subscribe({
      next: (data: any) => {
        if (request !== this.request) return;
        this.loading = false;
        this.stats = data;
        this.buildKpiCards();
        this.buildHistoryChart();
        this.buildProductChart();
        this.buildTop3();
      },
      error: () => { if (request === this.request) this.loading = false; }
    });
  }

  onPeriodChange(newPeriod: string): void {
    this.period = newPeriod;
    this.customFrom = null;
    this.customTo = null;
    this.load();
  }

  /** Custom range from the "Période" field; emptied → back to the last 30 days. */
  onCustomRange(range: DateRange): void {
    if (!range.from && !range.to) {
      this.onPeriodChange('MONTH');
      return;
    }
    this.period = 'CUSTOM';
    this.customFrom = range.from;
    this.customTo = range.to ?? range.from;
    this.load();
  }

  /** "du 01/11/2026 au 22/11/2026", "le 22/11/2026" or "depuis le début", from the range the API used. */
  get rangeLabel(): string {
    const from = this.stats?.fromDate, to = this.stats?.toDate;
    if (!from && !to) return 'Depuis le début';
    const fmt = (d: string) => `${d.substring(8, 10)}/${d.substring(5, 7)}/${d.substring(0, 4)}`;
    return from === to ? `Le ${fmt(from)}` : `Du ${fmt(from)} au ${fmt(to)}`;
  }

  get historyTitle(): string {
    switch (this.stats?.granularity) {
      case 'HOUR': return 'Ventes par heure';
      case 'MONTH': return 'Ventes par mois';
      default: return 'Ventes par jour';
    }
  }

  /** At least one sale in the history (empty buckets come back at 0). */
  get hasHistory(): boolean {
    return (this.stats?.salesHistory ?? []).some((h: any) => +(h.salesCount ?? 0) > 0);
  }

  private buildKpiCards(): void {
    const revenue = this.stats?.totalSalesRevenue ?? 0;
    const entryVal = this.stats?.totalEntryValue ?? 0;
    const lossVal = this.stats?.totalLossValue ?? 0;
    const benefit = this.stats?.netBenefit ?? 0;

    this.kpiCards = [
      {
        label: 'Total Ventes',
        value: this.formatNumber(this.stats?.totalSalesCount ?? 0),
        icon: 'mat:shopping_cart',
        colorClass: 'bg-blue-50 text-blue-600',
        sublabel: `Qté: ${this.formatNumber(this.stats?.totalSalesQuantity ?? 0)}`
      },
      {
        label: 'Chiffre d\'Affaires',
        value: this.formatCurrency(revenue),
        icon: 'mat:attach_money',
        colorClass: 'bg-green-50 text-green-600'
      },
      {
        label: 'Achats (Entrées)',
        value: this.formatCurrency(entryVal),
        icon: 'mat:input',
        colorClass: 'bg-orange-50 text-orange-600'
      },
      {
        label: 'Pertes',
        value: this.formatCurrency(lossVal),
        icon: 'mat:remove_circle_outline',
        colorClass: 'bg-red-50 text-red-500'
      },
      {
        label: 'Bénéfice Net',
        value: this.formatCurrency(benefit),
        icon: 'mat:account_balance',
        colorClass: +benefit >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'
      }
    ];
  }

  private buildHistoryChart(): void {
    const history: any[] = this.stats?.salesHistory ?? [];
    const categories = history.map((h: any) => h.period);
    const revenueData = history.map((h: any) => +(h.salesRevenue ?? 0));
    const countData = history.map((h: any) => +(h.salesCount ?? 0));

    const hourly = this.stats?.granularity === 'HOUR';
    this.historyChartOptions = {
      chart: { type: hourly ? 'bar' : 'area', height: 280, toolbar: { show: false }, zoom: { enabled: false } },
      plotOptions: { bar: { borderRadius: 3, columnWidth: '60%' } },
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
      dataLabels: { enabled: false },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      xaxis: {
        categories,
        labels: { rotate: -30, style: { fontSize: '11px' }, hideOverlappingLabels: true },
        tickAmount: hourly ? undefined : Math.min(categories.length, 12)
      },
      yaxis: [
        {
          title: { text: 'Revenus' },
          labels: { formatter: (v: number) => this.formatCurrency(v) }
        },
        {
          opposite: true,
          title: { text: 'Nb ventes' },
          labels: { formatter: (v: number) => String(v) }
        }
      ],
      tooltip: {
        shared: true,
        y: [
          { formatter: (v: number) => this.formatCurrency(v) },
          { formatter: (v: number) => `${v} vente(s)` }
        ]
      },
      legend: { position: 'top' },
      colors: ['#3b82f6', '#10b981']
    };

    this.historyChartSeries = [
      { name: 'Chiffre d\'Affaires', data: revenueData },
      { name: 'Nb Ventes', data: countData }
    ];
  }

  private buildProductChart(): void {
    const products: any[] = (this.stats?.productStats ?? []).slice(0, 10);
    const labels = products.map((p: any) => p.productName ?? p.productCode ?? '');
    const revenues = products.map((p: any) => +(p.salesRevenue ?? 0));

    this.productChartOptions = {
      chart: { type: 'bar', height: 280, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 4, horizontal: true } },
      dataLabels: { enabled: false },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      xaxis: {
        categories: labels,
        labels: { formatter: (v: string) => this.formatCurrency(+v) }
      },
      tooltip: { y: { formatter: (v: number) => this.formatCurrency(v) } },
      colors: ['#8b5cf6'],
      legend: { show: false }
    };

    this.productChartSeries = [
      { name: 'Revenus', data: revenues }
    ];
  }

  private buildTop3(): void {
    const products: any[] = this.stats?.productStats ?? [];
    this.top3ByQuantity = [...products]
      .sort((a, b) => (b.salesQuantity ?? 0) - (a.salesQuantity ?? 0))
      .slice(0, 3);
    this.top3ByMargin = [...products]
      .sort((a, b) => (b.margin ?? 0) - (a.margin ?? 0))
      .slice(0, 3);
  }

  totalSalesRevenue(): string {
    const total = (this.stats?.productStats ?? []).reduce(
      (sum: number, p: any) => sum + +(p.salesRevenue ?? 0), 0
    );
    return this.formatCurrency(total);
  }

  formatCurrency(value: number): string {
    if (value == null || isNaN(value)) return '0 Da';
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + ' Da';
  }

  formatNumber(value: number): string {
    if (value == null || isNaN(value)) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }
}
