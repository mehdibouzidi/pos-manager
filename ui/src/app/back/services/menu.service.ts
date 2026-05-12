import { Injectable, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Product, ProductCategory } from '../models/product.model';
import { ProductService } from '../../../backend/service/business/product.service';
import { ProductCategoryService } from '../../../backend/service/business/product-category.service';
import { ConnectivityService } from '../../../backend/service/offline/connectivity.service';
import { OfflineStorageService } from '../../../backend/service/offline/offline-storage.service';
import { SyncService } from '../../../backend/service/offline/sync.service';
import { UtilStatic } from '../../../backend/service/util/UtilStatic';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private _categories = signal<ProductCategory[]>([]);
  private _products = signal<Product[]>([]);
  private _selectedCategoryId = signal<number | null>(null);
  private _loading = signal<boolean>(false);

  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly selectedCategoryId = this._selectedCategoryId.asReadonly();

  readonly filteredProducts = computed(() => {
    const catId = this._selectedCategoryId();
    if (catId === null) return this._products();
    return this._products().filter(p => p.categoryId === catId);
  });

  constructor(
    private productService: ProductService,
    private categoryService: ProductCategoryService,
    private connectivity: ConnectivityService,
    private offlineStorage: OfflineStorageService,
    private syncService: SyncService
  ) {
    this.loadData();
    // Reload products from API after each successful sync
    this.syncService.syncCompleted$.subscribe(() => this.reloadProducts());
  }

  loadData(): void {
    if (!this.connectivity.isOnline()) {
      this.loadFromCache();
      return;
    }
    this._loading.set(true);
    forkJoin({
      categories: this.categoryService.findAll(),
      products: this.productService.findAll()
    }).subscribe({
      next: ({ categories, products }) => {
        const cats = categories as ProductCategory[];
        const prods = products as Product[];
        this._categories.set(cats);
        this._products.set(prods);
        if (cats.length > 0) {
          this._selectedCategoryId.set(cats[0].id);
        }
        this._loading.set(false);
        // Persist menu data (products + categories) for offline use
        const posId = parseInt(localStorage.getItem(UtilStatic.POS_ID) ?? '0', 10);
        if (posId > 0) {
          this.offlineStorage.saveMenuData(posId, prods, cats).catch(() => {});
        }
      },
      error: (err) => {
        console.error('Failed to load menu data', err);
        this._loading.set(false);
        // Fall back to cache
        this.loadFromCache();
      }
    });
  }

  private loadFromCache(): void {
    const posId = parseInt(localStorage.getItem(UtilStatic.POS_ID) ?? '0', 10);
    if (posId === 0) return;
    this._loading.set(true);
    this.offlineStorage.getMenuData(posId).then(({ products, categories }) => {
      this._products.set(products);
      this._categories.set(categories);
      if (categories.length > 0 && this._selectedCategoryId() === null) {
        this._selectedCategoryId.set(categories[0].id);
      }
      this._loading.set(false);
    }).catch(() => {
      this._loading.set(false);
    });
  }

  reloadProducts(): void {
    this.productService.findAll().subscribe({
      next: (products) => {
        const prods = products as Product[];
        this._products.set(prods);
        // Update cache with fresh stock levels
        const posId = parseInt(localStorage.getItem(UtilStatic.POS_ID) ?? '0', 10);
        if (posId > 0) {
          this.offlineStorage.saveMenuData(posId, prods, this._categories()).catch(() => {});
        }
      },
      error: () => {}
    });
  }

  /** Decrements stock locally after an offline sale, so the UI stays consistent */
  applyOfflineSale(items: Array<{ productId: number; quantity: number }>): void {
    const updated = this._products().map(p => {
      const item = items.find(i => i.productId === p.id);
      if (!item) return p;
      return { ...p, currentStock: p.currentStock - item.quantity };
    });
    this._products.set(updated);
    // Persist updated stock to cache
    const posId = parseInt(localStorage.getItem(UtilStatic.POS_ID) ?? '0', 10);
    if (posId > 0) {
      this.offlineStorage.saveMenuData(posId, updated, this._categories()).catch(() => {});
    }
  }

  selectCategory(categoryId: number): void {
    this._selectedCategoryId.set(categoryId);
  }

  getSelectedCategory(): ProductCategory | undefined {
    return this._categories().find(c => c.id === this._selectedCategoryId());
  }

  getFilteredProducts(): Product[] {
    return this.filteredProducts();
  }
}