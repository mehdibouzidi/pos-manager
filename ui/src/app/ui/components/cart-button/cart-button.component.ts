import { Component, inject } from '@angular/core';
import { CartService } from '../../../back/services/cart.service';

@Component({
  selector: 'app-cart-button',
  standalone: true,
  template: `
    <button class="cart-button" (click)="cartService.toggleCart()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
      </svg>
      @if (cartService.itemCount() > 0) {
        <span class="badge">{{ cartService.itemCount() }}</span>
      }
    </button>
  `,
  styles: [`
    .cart-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--primary-orange);
      color: white;
      box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 100;
    }

    .cart-button:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 32px rgba(249, 115, 22, 0.5);
    }

    .cart-button svg {
      width: 28px;
      height: 28px;
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      background: #ef4444;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }
  `]
})
export class CartButtonComponent {
  cartService = inject(CartService);
}
