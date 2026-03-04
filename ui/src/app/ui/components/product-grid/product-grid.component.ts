import { Component, inject } from '@angular/core';
import { MenuService } from '../../../back/services/menu.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CategoryTabsComponent } from '../category-tabs/category-tabs.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [ProductCardComponent, CategoryTabsComponent],
  template: `
    <div class="product-grid-container">
      <div class="grid-header">
        <h2 class="category-title">{{ menuService.getSelectedCategory()?.name }}</h2>
      </div>
      <app-category-tabs />
      <div class="products-grid">
        @for (product of menuService.getFilteredProducts(); track product.id) {
          <app-product-card [product]="product" />
        } @empty {
          <div class="empty-state">
            <p>Aucun produit trouvé dans cette catégorie</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .product-grid-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .grid-header {
      margin-bottom: 8px;
    }

    .category-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-dark);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
      padding: 16px 0;
      overflow-y: auto;
      flex: 1;
    }

    .products-grid::-webkit-scrollbar {
      width: 6px;
    }

    .products-grid::-webkit-scrollbar-track {
      background: transparent;
    }

    .products-grid::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 3px;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: var(--text-gray);
    }
  `]
})
export class ProductGridComponent {
  menuService = inject(MenuService);
}
