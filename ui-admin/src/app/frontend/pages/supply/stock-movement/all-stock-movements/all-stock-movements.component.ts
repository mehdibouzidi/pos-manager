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
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { finalize } from 'rxjs/operators';
import { DeleteConfirmationDialogComponent } from 'src/app/frontend/common/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { StockMovementCriteria } from 'src/app/backend/criteria/business/stock-movement-criteria';
import { StockMovementPayload } from 'src/app/backend/payloads/business/stock-movement-payload';
import { StockMovementService } from 'src/app/backend/service/business/stock-movement.service';
import { AddStockMovementComponent } from '../add-stock-movement/add-stock-movement.component';
import { EditStockMovementComponent } from '../edit-stock-movement/edit-stock-movement.component';
import { ShowStockMovementComponent } from '../show-stock-movement/show-stock-movement.component';

@Component({
  selector: 'vex-all-stock-movements',
  standalone: true,
  templateUrl: './all-stock-movements.component.html',
  styleUrl: './all-stock-movements.component.scss',
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
export class AllStockMovementsComponent {
  criteria = new StockMovementCriteria();
  globalPayload = new GlobalPayload<StockMovementPayload>();

  constructor(
    private service: StockMovementService,
    private liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    public authService: AuthService
  ) {}

  canCreate(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.STOCK_MOVEMENT_CREATE, AdminConstants.ADMIN));
  }
  canEdit(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.STOCK_MOVEMENT_UPDATE, AdminConstants.ADMIN));
  }
  canDelete(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.STOCK_MOVEMENT_DELETE, AdminConstants.ADMIN));
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
    this.criteria.reason = this.criteria.reason || null;
    this.findByCriteria();
  }

  findByCriteria() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.service.findAllByCriteria(this.criteria)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: GlobalPayload<StockMovementPayload>) => {
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
          next: (response: boolean) => {
            if (response) this.search();
          },
          error: () => {}
        });
      }
    });
  }

  goToAdd() {
    const dialogRef = this.dialog.open(AddStockMovementComponent, { width: '600px', data: {} });
    dialogRef.afterClosed().subscribe(() => this.search());
  }

  goToEdit(element: StockMovementPayload) {
    const dialogRef = this.dialog.open(EditStockMovementComponent, { width: '600px', data: { element } });
    dialogRef.afterClosed().subscribe(() => this.search());
  }

  goToShow(element: StockMovementPayload) {
    this.dialog.open(ShowStockMovementComponent, { width: '600px', data: { element } });
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading = false;
  dataSource = new MatTableDataSource<StockMovementPayload>();
  selection = new SelectionModel<StockMovementPayload>(true, []);

  @Input()
  columns: TableColumn<StockMovementPayload>[] = [
    { label: 'Produit', property: 'productName', type: 'text', visible: true },
    { label: 'Type', property: 'movementType', type: 'text', visible: true },
    { label: 'Quantité', property: 'quantity', type: 'text', visible: true },
    { label: 'Motif', property: 'reason', type: 'text', visible: true },
    { label: 'Date', property: 'movementDate', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  toggleColumnVisibility(column: TableColumn<StockMovementPayload>, event: Event) {
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
