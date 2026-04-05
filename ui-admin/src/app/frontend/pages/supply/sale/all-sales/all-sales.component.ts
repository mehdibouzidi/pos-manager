import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { finalize } from 'rxjs/operators';
import { StockMovementCriteria } from 'src/app/backend/criteria/business/stock-movement-criteria';
import { StockMovementPayload } from 'src/app/backend/payloads/business/stock-movement-payload';
import { StockMovementService } from 'src/app/backend/service/business/stock-movement.service';
import { ProductPayload } from 'src/app/backend/payloads/business/productpayload';
import { ProductService } from 'src/app/backend/service/business/product.service';
import { ProductCategoryPayload } from 'src/app/backend/payloads/business/product-category-payload';
import { ProductCategoryService } from 'src/app/backend/service/business/product-category.service';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';

@Component({
  selector: 'vex-all-sales',
  standalone: true,
  templateUrl: './all-sales.component.html',
  styleUrl: './all-sales.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexPageLayoutComponent, VexPageLayoutHeaderDirective, VexBreadcrumbsComponent,
    MatButtonToggleModule, ReactiveFormsModule, VexPageLayoutContentDirective,
    NgIf, MatButtonModule, MatTooltipModule, MatIconModule, MatMenuModule,
    MatTableModule, MatSortModule, NgFor, NgClass, MatPaginatorModule,
    FormsModule, MatInputModule,
    MatProgressBarModule, CommonModule, MatAutocompleteModule, MatOptionModule
  ]
})
export class AllSalesComponent implements OnInit {
  criteria = new StockMovementCriteria();
  globalPayload = new GlobalPayload<StockMovementPayload>();

  allProducts: ProductPayload[] = [];
  filteredProducts: ProductPayload[] = [];
  productCtrl = new FormControl('');

  allCategories: ProductCategoryPayload[] = [];
  filteredCategories: ProductCategoryPayload[] = [];
  categoryCtrl = new FormControl('');

  constructor(
    private service: StockMovementService,
    private productService: ProductService,
    private categoryService: ProductCategoryService,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  ngOnInit(): void {
    this.criteria.movementType = 'SALE';
    this.setupTable();
    this.loadProducts();
    this.loadCategories();
    this.search();
  }

  loadProducts() {
    this.productService.findAll().subscribe({
      next: (data: any) => {
        this.allProducts = data || [];
        this.filteredProducts = this.allProducts;
      }
    });
  }

  loadCategories() {
    this.categoryService.findAll().subscribe({
      next: (data: any) => {
        this.allCategories = data || [];
        this.filteredCategories = this.allCategories;
      }
    });
  }

  onProductInput(value: string) {
    const lower = (value || '').toLowerCase();
    this.filteredProducts = this.allProducts.filter(p =>
      p.name?.toLowerCase().includes(lower) || p.code?.toLowerCase().includes(lower)
    );
    if (!value) {
      this.criteria.productId = null;
      this.search();
    }
  }

  selectProduct(event: MatAutocompleteSelectedEvent) {
    const product: ProductPayload = event.option.value;
    this.productCtrl.setValue(product.name, { emitEvent: false });
    this.criteria.productId = product.id;
    this.search();
  }

  clearProduct() {
    this.productCtrl.setValue('');
    this.filteredProducts = this.allProducts;
    this.criteria.productId = null;
    this.search();
  }

  onCategoryInput(value: string) {
    const lower = (value || '').toLowerCase();
    this.filteredCategories = this.allCategories.filter(c =>
      c.name?.toLowerCase().includes(lower) || c.code?.toLowerCase().includes(lower)
    );
    if (!value) {
      this.criteria.categoryId = null;
      this.search();
    }
  }

  selectCategory(event: MatAutocompleteSelectedEvent) {
    const cat: ProductCategoryPayload = event.option.value;
    this.categoryCtrl.setValue(cat.name, { emitEvent: false });
    this.criteria.categoryId = cat.id;
    this.search();
  }

  clearCategory() {
    this.categoryCtrl.setValue('');
    this.filteredCategories = this.allCategories;
    this.criteria.categoryId = null;
    this.search();
  }

  setupTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  search() {
    this.criteria.movementType = 'SALE';
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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading = false;
  dataSource = new MatTableDataSource<StockMovementPayload>();

  @Input()
  columns: TableColumn<StockMovementPayload>[] = [
    { label: 'Produit',   property: 'productName',  type: 'text', visible: true },
    { label: 'Catégorie', property: 'categoryName', type: 'text', visible: true },
    { label: 'Prix',      property: 'retailPrice',  type: 'text', visible: true },
    { label: 'Quantité',  property: 'quantity',     type: 'text', visible: true },
    { label: 'Total',     property: 'total',        type: 'text', visible: true },
    { label: 'Date',      property: 'movementDate', type: 'text', visible: true }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

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
}
