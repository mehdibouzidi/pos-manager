import { Injectable, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Product, ProductCategory } from '../models/product.model';
import { ProductService } from '../../../backend/service/business/product.service';
import { ProductCategoryService } from '../../../backend/service/business/product-category.service';

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
    private categoryService: ProductCategoryService
  ) {
    this.loadData();
  }

  loadData(): void {
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
      },
      error: (err) => {
        console.error('Failed to load menu data', err);
        this._loading.set(false);
      }
    });
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