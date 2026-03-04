import { Component, Input, inject } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Product } from '../../../back/models/product.model';
import { CartService } from '../../../back/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  template: `
    <div class="product-card" [ngClass]="{ 'out-of-stock': product.stock === 0 }">
      <div class="product-image">
        <img [src]="product.image" [alt]="product.name">
        @if (product.stock === 0) {
          <div class="stock-overlay">Épuisé</div>
        }
      </div>
      <div class="product-info">
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-description">{{ product.description }}</p>
        <div class="stock-badge" [ngClass]="getStockClass()">
          @if (product.stock === 0) {
            <span>Rupture de stock</span>
          } @else if (product.stock <= 5) {
            <span>⚠ Plus que {{ product.stock }} disponible{{ product.stock > 1 ? 's' : '' }}</span>
          } @else {
            <span>✓ En stock ({{ product.stock }})</span>
          }
        </div>
        <div class="product-footer">
          <span class="product-price">
            <span class="currency">$</span>{{ product.price | currency:'':'':'1.2-2' }}
          </span>
          <button
            class="add-btn"
            aria-label="Ajouter au panier"
            [disabled]="product.stock === 0"
            (click)="addToCart()"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: 16px;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .product-card.out-of-stock {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .product-card.out-of-stock:hover {
      transform: none;
      box-shadow: var(--shadow-sm);
    }

    .product-image {
      width: 100%;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      overflow: hidden;
      border-radius: var(--radius-md);
      background: var(--bg-light);
      position: relative;
    }

    .product-image img {
      width: 85%;
      height: 85%;
      object-fit: contain;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .stock-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      color: white;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      letter-spacing: 0.5px;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 6px;
      line-height: 1.3;
    }

    .product-description {
      font-size: 11px;
      color: var(--text-gray);
      line-height: 1.4;
      margin-bottom: 8px;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stock-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 99px;
      margin-bottom: 10px;
      width: fit-content;
    }

    .stock-badge.stock-ok {
      background: #dcfce7;
      color: #16a34a;
    }

    .stock-badge.stock-low {
      background: #fff7ed;
      color: #ea580c;
    }

    .stock-badge.stock-out {
      background: #fee2e2;
      color: #dc2626;
    }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .product-price {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-orange);
    }

    .currency {
      font-size: 12px;
      margin-right: 1px;
    }

    .add-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-orange);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .add-btn:hover:not(:disabled) {
      background: var(--primary-orange-dark);
      transform: scale(1.1);
    }

    .add-btn:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }
  `]
})
export class ProductCardComponent {
  private cartService = inject(CartService);
  
  @Input({ required: true }) product!: Product;

  addToCart(): void {
    if (this.product.stock > 0) {
      this.cartService.addToCart(this.product);
    }
  }

  getStockClass(): string {
    if (this.product.stock === 0) return 'stock-out';
    if (this.product.stock <= 5) return 'stock-low';
    return 'stock-ok';
  }
}
