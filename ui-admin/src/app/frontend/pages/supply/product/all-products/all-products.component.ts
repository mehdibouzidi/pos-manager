import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import {
  Component,
  Input,
  ViewChild
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl
} from '@angular/forms';
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
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { TableColumn } from '@vex/interfaces/table-column.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DeleteConfirmationDialogComponent } from 'src/app/frontend/common/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { EditProductComponent } from '../edit-product/edit-product.component';
import { ShowProductComponent } from '../show-product/show-product.component';
import { ProductCriteria } from 'src/app/backend/criteria/business/productcriteria';
import { ProductPayload } from 'src/app/backend/payloads/business/productpayload';
import { ProductService } from 'src/app/backend/service/business/product.service';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'vex-all-products',
  standalone: true,
  templateUrl: './all-products.component.html',
  styleUrl: './all-products.component.scss',
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
export class AllProductsComponent {
  criteria = new ProductCriteria();
  globalPayload = new GlobalPayload<ProductPayload>();

  /******************************************************GLOBAL INITIALIZATION*********************************************************************/
  constructor(
    private service: ProductService,
    private router: Router,
    private liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public authService: AuthService
  ) {}

  canCreate(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.PRODUCT_CREATE,AdminConstants.ADMIN));
  }
  canEdit(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.PRODUCT_UPDATE,AdminConstants.ADMIN));
  }
  canDelete(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.PRODUCT_DELETE,AdminConstants.ADMIN));
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
        next: (response: GlobalPayload<ProductPayload>) => {
        if (response) {
          this.globalPayload = response;
          this.dataSource.data = this.globalPayload.elements;
        }
      },
      error: () => {} // Handle error appropriately
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
          error: () => {
            // Handle error appropriately
          }
        });
      }
    });
  }

  /******************************************************UI INITIALIZATION*********************************************************************/

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading = false;

  dataSource = new MatTableDataSource<ProductPayload>();
  selection = new SelectionModel<ProductPayload>(true, []);

  @Input()
  columns: TableColumn<ProductPayload>[] = [
    {
      label: 'Code',
      property: 'code',
      type: 'text',
      visible: true
    },
    {
      label: 'Nom',
      property: 'name',
      type: 'text',
      visible: true
    },
    {
      label: 'Stock Min',
      property: 'minStock',
      type: 'text',
      visible: true
    },
    {
      label: 'Stock Max',
      property: 'maxStock',
      type: 'text',
      visible: true
    },
    {
      label: 'Stock Réel',
      property: 'currentStock',
      type: 'text',
      visible: true
    },
    {
      label: 'Prix de Gros',
      property: 'wholesalePrice',
      type: 'text',
      visible: true
    },
    {
      label: 'Prix Détail',
      property: 'retailPrice',
      type: 'text',
      visible: true
    },
    {
      label: 'Marque',
      property: 'brand',
      type: 'child',
      visible: true
    },
    {
      label: 'Créé le',
      property: 'createdAt',
      type: 'text',
      visible: false,
      cssClasses: ['font-medium']
    },
    {
      label: 'Modifié le',
      property: 'updatedAt',
      type: 'text',
      visible: false,
      cssClasses: ['font-medium']
    },
    {
      label: 'Créé par',
      property: 'createdByFullName',
      type: 'text',
      visible: false,
    },
    {
      label: 'Modifié par',
      property: 'updatedByFullName',
      type: 'text',
      visible: false,
    },
    {
      label: 'Actions',
      property: 'actions',
      type: 'button',
      visible: true
    }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  toggleColumnVisibility(column: TableColumn<ProductPayload>, event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  announceSortChange(sortState: Sort) {
    this.criteria.sortColumn = sortState.active;
    this.criteria.sort = sortState.direction;
    this.search();
    this.liveAnnouncer.announce(
      sortState.direction
        ? `Sorted ${sortState.direction}ending`
        : 'Sorting cleared'
    );
  }

  onPaginationChange(event?: PageEvent) {
    this.criteria.pages = event?.pageIndex;
    this.criteria.size = event?.pageSize;
    this.search();
    return event;
  }

  goToAdd(): void {
    const dialogRef = this.dialog.open(AddProductComponent, {
      width: '950px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.search();

    });
  }

  goToEdit(element: ProductPayload) {
    const dialogRef = this.dialog.open(EditProductComponent, {
      width: '950px',
      data: { element }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.search();

    });
  }

  goToShow(element: ProductPayload) {
    const dialogRef = this.dialog.open(ShowProductComponent, {
      width: '950px',
      data: { element }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.search();

    });
  }

  goToImport() {
    this.router.navigate(['import'], { relativeTo: this.route });
  }
}
