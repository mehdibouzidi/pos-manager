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
import { SelectionModel } from '@angular/cdk/collections';
import { TableColumn } from '@vex/interfaces/table-column.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { DeleteConfirmationDialogComponent } from 'src/app/frontend/common/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { finalize } from 'rxjs/operators';
import { ApiKeyCriteria } from 'src/app/backend/criteria/admin/api-key-criteria';
import { ApiKeyPayload } from 'src/app/backend/payloads/admin/api-key-payload';
import { ApiKeyService } from 'src/app/backend/service/admin/api-key.service';
import { AddApiKeyComponent } from '../add-api-key/add-api-key.component';
import { EditApiKeyComponent } from '../edit-api-key/edit-api-key.component';
import { ShowApiKeyComponent } from '../show-api-key/show-api-key.component';

@Component({
  selector: 'vex-all-api-keys',
  standalone: true,
  templateUrl: './all-api-keys.component.html',
  styleUrl: './all-api-keys.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexPageLayoutComponent,
    VexPageLayoutHeaderDirective,
    VexBreadcrumbsComponent,
    MatButtonToggleModule,
    ReactiveFormsModule,
    VexPageLayoutContentDirective,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    NgFor,
    NgClass,
    MatPaginatorModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    CommonModule
  ]
})
export class AllApiKeysComponent {
  criteria = new ApiKeyCriteria();
  globalPayload = new GlobalPayload<ApiKeyPayload>();

  constructor(
    private service: ApiKeyService,
    private liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    public authService: AuthService
  ) {}

  canCreate(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.API_KEY_CREATE, AdminConstants.ADMIN));
  }
  canEdit(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.API_KEY_UPDATE, AdminConstants.ADMIN));
  }
  canDelete(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.API_KEY_DELETE, AdminConstants.ADMIN));
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
    this.criteria.description = this.criteria.description || null;
    this.findByCriteria();
  }

  findByCriteria() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.service.findAllByCriteria(this.criteria)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: GlobalPayload<ApiKeyPayload>) => {
          if (response) {
            this.globalPayload = response;
            this.dataSource.data = this.globalPayload.elements;
          }
        },
        error: () => {}
      });
  }

  delete(id: number) {
    if (!this.canDelete()) return;
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.delete(id).subscribe({
          next: (response: boolean) => { if (response) this.search(); },
          error: () => {}
        });
      }
    });
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading = false;

  dataSource = new MatTableDataSource<ApiKeyPayload>();
  selection = new SelectionModel<ApiKeyPayload>(true, []);

  @Input()
  columns: TableColumn<ApiKeyPayload>[] = [
    { label: 'POS', property: 'posName', type: 'text', visible: true },
    { label: 'Description', property: 'description', type: 'text', visible: true },
    { label: 'Clé', property: 'keyValue', type: 'text', visible: true, cssClasses: ['font-mono', 'text-xs'] },
    { label: 'Actif', property: 'active', type: 'text', visible: true },
    { label: 'Créé le', property: 'createdAt', type: 'text', visible: false },
    { label: 'Créé par', property: 'createdByFullName', type: 'text', visible: false },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  toggleColumnVisibility(column: TableColumn<ApiKeyPayload>, event: Event) {
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

  goToAdd(): void {
    const dialogRef = this.dialog.open(AddApiKeyComponent, { width: '700px' });
    dialogRef.afterClosed().subscribe(() => { this.search(); });
  }

  goToEdit(element: ApiKeyPayload) {
    const dialogRef = this.dialog.open(EditApiKeyComponent, { width: '700px', data: { element } });
    dialogRef.afterClosed().subscribe(() => { this.search(); });
  }

  goToShow(element: ApiKeyPayload) {
    const dialogRef = this.dialog.open(ShowApiKeyComponent, { width: '700px', data: { element } });
    dialogRef.afterClosed().subscribe(() => { this.search(); });
  }
}
