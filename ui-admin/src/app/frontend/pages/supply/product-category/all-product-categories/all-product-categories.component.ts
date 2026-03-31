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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DeleteConfirmationDialogComponent } from 'src/app/frontend/common/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ProductCategoryCriteria } from 'src/app/backend/criteria/business/product-category-criteria';
import { ProductCategoryPayload } from 'src/app/backend/payloads/business/product-category-payload';
import { ProductCategoryService } from 'src/app/backend/service/business/product-category.service';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { finalize } from 'rxjs/operators';
import { AddProductCategoryComponent } from '../add-product-category/add-product-category.component';
import { EditProductCategoryComponent } from '../edit-product-category/edit-product-category.component';
import { ShowProductCategoryComponent } from '../show-product-category/show-product-category.component';

@Component({
  selector: 'vex-all-product-categories',
  standalone: true,
  templateUrl: './all-product-categories.component.html',
  styleUrl: './all-product-categories.component.scss',
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
    CommonModule,
    MatDatepickerModule,
    MatAutocompleteModule
  ]
})
export class AllProductCategoriesComponent {
  criteria = new ProductCategoryCriteria();
  globalPayload = new GlobalPayload<ProductCategoryPayload>();

  /******************************************************GLOBAL INITIALIZATION*********************************************************************/
  constructor(
    private service: ProductCategoryService,
    private liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    public authService: AuthService
  ) {}

  canCreate(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.PRODUCT_CATEGORY_CREATE, AdminConstants.ADMIN));
  }
  canEdit(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.PRODUCT_CATEGORY_UPDATE, AdminConstants.ADMIN));
  }
  canDelete(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.PRODUCT_CATEGORY_DELETE, AdminConstants.ADMIN));
  }

  /******************************************************DATA INITIALIZATION*********************************************************************/

  ngOnInit(): void {
    this.setupTable();
    this.search();
  }

  setupTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  search() {
    this.checkCriteria();
    this.findByCriteria();
  }

  checkCriteria() {
    this.criteria.name = this.criteria.name || null;
    this.criteria.code = this.criteria.code || null;
  }

  findByCriteria() {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    this.service.findAllByCriteria(this.criteria)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: GlobalPayload<ProductCategoryPayload>) => {
          if (response) {
            this.globalPayload = response;
            this.dataSource.data = this.globalPayload.elements;
          }
        },
        error: () => {}
      });
  }

  delete(id: number) {
    if (!this.canDelete()) {
      return;
    }
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.delete(id).subscribe({
          next: (response: boolean) => {
            if (response) {
              this.search();
            }
          },
          error: () => {}
        });
      }
    });
  }

  /******************************************************UI INITIALIZATION*********************************************************************/

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading = false;

  dataSource = new MatTableDataSource<ProductCategoryPayload>();
  selection = new SelectionModel<ProductCategoryPayload>(true, []);

  @Input()
  columns: TableColumn<ProductCategoryPayload>[] = [
    { label: 'Photo', property: 'photo', type: 'image' as any, visible: true },
    { label: 'Code', property: 'code', type: 'text', visible: true },
    { label: 'Nom', property: 'name', type: 'text', visible: true },
    { label: 'Créé le', property: 'createdAt', type: 'text', visible: false, cssClasses: ['font-medium'] },
    { label: 'Modifié le', property: 'updatedAt', type: 'text', visible: false, cssClasses: ['font-medium'] },
    { label: 'Créé par', property: 'createdByFullName', type: 'text', visible: false },
    { label: 'Modifié par', property: 'updatedByFullName', type: 'text', visible: false },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  toggleColumnVisibility(column: TableColumn<ProductCategoryPayload>, event: Event) {
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
    this.liveAnnouncer.announce(
      sortState.direction ? `Sorted ${sortState.direction}ending` : 'Sorting cleared'
    );
  }

  onPaginationChange(event?: PageEvent) {
    this.criteria.pages = event?.pageIndex;
    this.criteria.size = event?.pageSize;
    this.search();
    return event;
  }

  goToAdd(): void {
    const dialogRef = this.dialog.open(AddProductCategoryComponent, { width: '700px' });
    dialogRef.afterClosed().subscribe(() => { this.search(); });
  }

  goToEdit(element: ProductCategoryPayload) {
    const dialogRef = this.dialog.open(EditProductCategoryComponent, { width: '700px', data: { element } });
    dialogRef.afterClosed().subscribe(() => { this.search(); });
  }

  goToShow(element: ProductCategoryPayload) {
    const dialogRef = this.dialog.open(ShowProductCategoryComponent, { width: '700px', data: { element } });
    dialogRef.afterClosed().subscribe(() => { this.search(); });
  }
}
