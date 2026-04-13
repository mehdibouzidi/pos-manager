import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { TableColumn } from '@vex/interfaces/table-column.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { finalize } from 'rxjs/operators';
import { CaisseSessionCriteria } from 'src/app/backend/criteria/business/caisse-session-criteria';
import { CaisseSessionPayload } from 'src/app/backend/payloads/business/caisse-session-payload';
import { CaisseSessionService } from 'src/app/backend/service/business/caisse-session.service';
import { ShowCaisseSessionComponent } from '../show-caisse-session/show-caisse-session.component';

@Component({
  selector: 'vex-all-caisse-sessions',
  standalone: true,
  templateUrl: './all-caisse-sessions.component.html',
  styleUrl: './all-caisse-sessions.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexPageLayoutComponent, VexPageLayoutHeaderDirective, VexBreadcrumbsComponent,
    MatButtonToggleModule, ReactiveFormsModule, VexPageLayoutContentDirective,
    NgIf, MatButtonModule, MatTooltipModule, MatIconModule, MatMenuModule,
    MatTableModule, MatSortModule, NgFor, NgClass, MatPaginatorModule,
    FormsModule, MatDialogModule, MatCheckboxModule, MatInputModule,
    MatProgressBarModule, CommonModule, MatSelectModule
  ]
})
export class AllCaisseSessionsComponent implements OnInit {
  criteria = new CaisseSessionCriteria();
  globalPayload = new GlobalPayload<CaisseSessionPayload>();

  constructor(
    private service: CaisseSessionService,
    private liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    public authService: AuthService
  ) {}

  canRead(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.CAISSE_SESSION_READ, AdminConstants.ADMIN));
  }

  ngOnInit(): void {
    this.setupTable();
    this.search();
  }

  setupTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  search() {
    this.criteria.fromDate = this.criteria.fromDate || null;
    this.criteria.toDate = this.criteria.toDate || null;
    this.criteria.status = this.criteria.status || null;
    this.findByCriteria();
  }

  clearFilters() {
    this.criteria.fromDate = null;
    this.criteria.toDate = null;
    this.criteria.status = null;
    this.search();
  }

  findByCriteria() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.service.findAllByCriteria(this.criteria)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: GlobalPayload<CaisseSessionPayload>) => {
          if (response) {
            this.globalPayload = response;
            this.dataSource.data = this.globalPayload.elements;
          }
        },
        error: () => {}
      });
  }

  goToShow(element: CaisseSessionPayload) {
    this.dialog.open(ShowCaisseSessionComponent, { width: '700px', data: { element } });
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading = false;
  dataSource = new MatTableDataSource<CaisseSessionPayload>();
  selection = new SelectionModel<CaisseSessionPayload>(true, []);

  @Input()
  columns: TableColumn<CaisseSessionPayload>[] = [
    { label: 'Terminal',     property: 'posName',           type: 'text',   visible: true },
    { label: 'Caissier',     property: 'createdByFullName', type: 'text',   visible: true },
    { label: 'Ouverture',    property: 'openedAt',          type: 'text',   visible: true },
    { label: 'Clôture',      property: 'closedAt',          type: 'text',   visible: true },
    { label: 'Fond',         property: 'openingBalance',    type: 'text',   visible: true },
    { label: 'Total ventes', property: 'totalSalesAmount',  type: 'text',   visible: true },
    { label: 'Commandes',    property: 'firstOrderNumber',  type: 'text',   visible: true },
    { label: 'Compté',       property: 'closingBalance',    type: 'text',   visible: false },
    { label: 'Écart',        property: 'variance',          type: 'text',   visible: true },
    { label: 'Statut',       property: 'status',            type: 'text',   visible: true },
    { label: 'Actions',      property: 'actions',           type: 'button', visible: true }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  toggleColumnVisibility(column: TableColumn<CaisseSessionPayload>, event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  get visibleColumns() {
    return this.columns.filter((column) => column.visible).map((column) => column.property);
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  announceSortChange(sortState: Sort) {
    this.criteria.sortColumn = sortState.active;
    this.criteria.sort = sortState.direction;
    this.search();
    this.liveAnnouncer.announce(sortState.direction ? `Sorted ${sortState.direction}ending` : 'Sorting cleared');
  }

  onPaginationChange(event?: PageEvent) {
    this.criteria.pages = event?.pageIndex;
    this.criteria.size = event?.pageSize;
    this.search();
    return event;
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
