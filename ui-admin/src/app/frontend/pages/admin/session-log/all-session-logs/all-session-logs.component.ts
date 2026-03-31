import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TableColumn } from '@vex/interfaces/table-column.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { finalize } from 'rxjs/operators';
import { SessionLogCriteria } from 'src/app/backend/criteria/admin/session-log-criteria';
import { SessionLogPayload } from 'src/app/backend/payloads/admin/session-log-payload';
import { SessionLogService } from 'src/app/backend/service/admin/session-log.service';
import { ShowSessionLogComponent } from '../show-session-log/show-session-log.component';

@Component({
  selector: 'vex-all-session-logs',
  standalone: true,
  templateUrl: './all-session-logs.component.html',
  styleUrl: './all-session-logs.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexPageLayoutComponent, VexPageLayoutHeaderDirective, VexBreadcrumbsComponent,
    MatButtonToggleModule, ReactiveFormsModule, VexPageLayoutContentDirective,
    NgIf, MatButtonModule, MatTooltipModule, MatIconModule, MatMenuModule,
    MatTableModule, MatSortModule, NgFor, NgClass, MatPaginatorModule,
    FormsModule, MatDialogModule, MatCheckboxModule, MatInputModule,
    MatProgressBarModule, CommonModule
  ]
})
export class AllSessionLogsComponent {
  criteria = new SessionLogCriteria();
  globalPayload = new GlobalPayload<SessionLogPayload>();

  constructor(
    private service: SessionLogService,
    private liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setupTable();
    this.search();
  }

  setupTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  search() {
    this.criteria.ipAddress = this.criteria.ipAddress || null;
    this.findByCriteria();
  }

  findByCriteria() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.service.findAllByCriteria(this.criteria)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: GlobalPayload<SessionLogPayload>) => {
          if (response) {
            this.globalPayload = response;
            this.dataSource.data = this.globalPayload.elements;
          }
        },
        error: () => {}
      });
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading = false;
  dataSource = new MatTableDataSource<SessionLogPayload>();

  @Input()
  columns: TableColumn<SessionLogPayload>[] = [
    { label: 'Utilisateur', property: 'userFullName', type: 'text', visible: true },
    { label: 'POS', property: 'posName', type: 'text', visible: true },
    { label: 'Adresse IP', property: 'ipAddress', type: 'text', visible: true },
    { label: 'Date de connexion', property: 'loginAt', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  toggleColumnVisibility(column: TableColumn<SessionLogPayload>, event: Event) {
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

  goToShow(element: SessionLogPayload) {
    this.dialog.open(ShowSessionLogComponent, { width: '600px', data: { element } });
  }
}
