import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../back/services/cart.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="cart-overlay" [class.open]="cartService.isCartOpen()" (click)="cartService.closeCart()"></div>
    <aside class="cart-sidebar" [class.open]="cartService.isCartOpen()">
      <div class="cart-header">
        <h2>Votre Commande</h2>
        <button class="close-btn" (click)="cartService.closeCart()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="cart-items">
        @if (cartService.items().length === 0) {
          <div class="empty-cart">
            <span class="empty-icon">🛒</span>
            <p>Votre panier est vide</p>
            <span class="empty-hint">Ajoutez des articles délicieux !</span>
          </div>
        } @else {
          @for (item of cartService.items(); track item.product.id) {
            <div class="cart-item">
              <div class="item-image">
                <img [src]="item.product.image" [alt]="item.product.name">
              </div>
              <div class="item-details">
                <h4>{{ item.product.name }}</h4>
                <span class="item-price">{{ item.product.price | currency }}</span>
              </div>
              <div class="item-controls">
                <button class="qty-btn" (click)="cartService.decrementQuantity(item.product.id)">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" (click)="cartService.incrementQuantity(item.product.id)">+</button>
              </div>
              <button class="remove-btn" (click)="cartService.removeFromCart(item.product.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
          }
        }
      </div>

      @if (cartService.items().length > 0) {
        <div class="cart-summary">
          <div class="summary-row">
            <span>Sous-total</span>
            <span>{{ cartService.subtotal() | currency }}</span>
          </div>
          <div class="summary-row">
            <span>Taxe (10%)</span>
            <span>{{ cartService.tax() | currency }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ cartService.total() | currency }}</span>
          </div>
          <button class="checkout-btn" (click)="cartService.openPayment()">
            Passer au paiement
          </button>
        </div>
      }
    </aside>
  `,
  styles: [`
    .cart-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 998;
    }

    .cart-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .cart-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 380px;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 999;
      display: flex;
      flex-direction: column;
    }

    .cart-sidebar.open {
      transform: translateX(0);
    }

    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .cart-header h2 {
      font-size: 20px;
      font-weight: 600;
    }

    .close-btn {
      background: transparent;
      color: var(--text-gray);
      padding: 8px;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: var(--bg-light);
      color: var(--text-dark);
    }

    .cart-items {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
    }

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-gray);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-cart p {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .empty-hint {
      font-size: 14px;
      color: var(--text-light);
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .item-image {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-md);
      background: var(--bg-light);
      overflow: hidden;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .item-details {
      flex: 1;
      min-width: 0;
    }

    .item-details h4 {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-price {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-orange);
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qty-btn {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      background: var(--bg-light);
      color: var(--text-dark);
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .qty-btn:hover {
      background: var(--primary-orange);
      color: white;
    }

    .qty-value {
      width: 24px;
      text-align: center;
      font-weight: 600;
    }

    .remove-btn {
      background: transparent;
      color: var(--text-light);
      padding: 8px;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }

    .remove-btn:hover {
      background: #fee2e2;
      color: #ef4444;
    }

    .cart-summary {
      padding: 20px 24px;
      border-top: 1px solid var(--border-color);
      background: var(--bg-light);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--text-gray);
    }

    .summary-row.total {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-dark);
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
      margin-bottom: 20px;
    }

    .checkout-btn {
      width: 100%;
      padding: 16px;
      background: var(--primary-orange);
      color: white;
      border-radius: var(--radius-md);
      font-size: 16px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .checkout-btn:hover {
      background: var(--primary-orange-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  `]
})
export class CartSidebarComponent {
  cartService = inject(CartService);
}
