import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
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
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { finalize } from 'rxjs/operators';
import { ProductCriteria } from 'src/app/backend/criteria/business/productcriteria';
import { ProductPayload } from 'src/app/backend/payloads/business/productpayload';
import { ProductService } from 'src/app/backend/service/business/product.service';
import { ProductCategoryPayload } from 'src/app/backend/payloads/business/product-category-payload';
import { ProductCategoryService } from 'src/app/backend/service/business/product-category.service';

@Component({
  selector: 'vex-current-stock',
  standalone: true,
  templateUrl: './current-stock.component.html',
  styleUrl: './current-stock.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexPageLayoutComponent, VexPageLayoutHeaderDirective, VexBreadcrumbsComponent,
    MatButtonToggleModule, ReactiveFormsModule, VexPageLayoutContentDirective,
    NgIf, MatButtonModule, MatTooltipModule, MatIconModule, MatMenuModule,
    MatTableModule, MatSortModule, NgFor, NgClass, MatPaginatorModule,
    FormsModule, MatInputModule, MatProgressBarModule, CommonModule,
    MatAutocompleteModule, MatOptionModule
  ]
})
export class CurrentStockComponent implements OnInit {
  criteria = new ProductCriteria();
  globalPayload = new GlobalPayload<ProductPayload>();

  allProducts: ProductPayload[] = [];
  filteredProducts: ProductPayload[] = [];
  productCtrl = new FormControl('');

  allCategories: ProductCategoryPayload[] = [];
  filteredCategories: ProductCategoryPayload[] = [];
  categoryCtrl = new FormControl('');

  constructor(
    private service: ProductService,
    private categoryService: ProductCategoryService,
    private liveAnnouncer: LiveAnnouncer,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.search();
  }

  loadProducts() {
    this.service.findAll().subscribe({
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
      this.criteria.name = null;
      this.search();
    }
  }

  selectProduct(event: MatAutocompleteSelectedEvent) {
    const product: ProductPayload = event.option.value;
    this.productCtrl.setValue(product.name, { emitEvent: false });
    this.criteria.name = product.name;
    this.search();
  }

  clearProduct() {
    this.productCtrl.setValue('');
    this.filteredProducts = this.allProducts;
    this.criteria.name = null;
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

  search() {
    this.findByCriteria();
  }

  findByCriteria() {
    if (this.isLoading) return;
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
        error: () => {}
      });
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading = false;
  dataSource = new MatTableDataSource<ProductPayload>();

  @Input()
  columns: TableColumn<ProductPayload>[] = [
    { label: 'Produit',      property: 'product',      type: 'text',   visible: true },
    { label: 'Catégorie',    property: 'categoryName', type: 'text',   visible: true },
    { label: 'Stock Min',    property: 'minStock',     type: 'text',   visible: true },
    { label: 'Stock Max',    property: 'maxStock',     type: 'text',   visible: true },
    { label: 'Stock Actuel', property: 'currentStock', type: 'text',   visible: true },
    { label: 'Prix Détail',  property: 'retailPrice',  type: 'text',   visible: true },
    { label: 'Valeur',       property: 'stockValue',   type: 'text',   visible: true }
  ];

  pageSize = 20;
  pageSizeOptions: number[] = [10, 20, 50, 100];

  toggleColumnVisibility(column: TableColumn<ProductPayload>, event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  get visibleColumns() {
    return this.columns.filter(c => c.visible).map(c => c.property);
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

  getStockValue(product: ProductPayload): number {
    return (product.currentStock ?? 0) * (product.retailPrice ?? 0);
  }

  get totalStockValue(): number {
    return this.dataSource.data.reduce((sum, p) => sum + this.getStockValue(p), 0);
  }

  getStockStatusClass(product: ProductPayload): string {
    const stock = product.currentStock ?? 0;
    const min = product.minStock ?? 0;
    const max = product.maxStock ?? 0;
    if (stock <= 0) return 'text-red-600 font-bold';
    if (min > 0 && stock <= min) return 'text-orange-500 font-semibold';
    if (max > 0 && stock >= max) return 'text-blue-500';
    return 'text-green-600';
  }
}
