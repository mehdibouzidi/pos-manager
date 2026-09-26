import { Component, Input, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../../back/models/product.model';
import { CartService } from '../../../back/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <button
      class="card"
      [class.out]="stock() <= 0"
      [disabled]="stock() <= 0"
      [attr.aria-label]="'Ajouter ' + product.name"
      (click)="add()"
    >
      <div class="media">
        @if (product.photo) {
          <img [src]="'data:image/jpeg;base64,' + product.photo" [alt]="''">
        } @else {
          <img class="default" src="assets/img/placeholder-product.svg" [alt]="''">
        }
        @if (inCart() > 0) {
          <span class="in-cart num" aria-label="Quantité dans le ticket">{{ inCart() }}</span>
        }
      </div>

      <span class="name">{{ product.name }}</span>

      <span class="footer">
        <span class="price num">{{ product.retailPrice | number:'1.2-2' }}<small> DA</small></span>
        <span class="stock num" [class.low]="stock() > 0 && stock() <= 5" [class.none]="stock() <= 0">
          @if (stock() <= 0) { Épuisé } @else { {{ stock() }} en stock }
        </span>
      </span>
    </button>
  `,
  styles: [`
    :host { display: block; }

    .card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px 10px 12px;
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      text-align: left;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    .card:hover:not(:disabled) {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .card:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
    }

    .card.out {
      cursor: not-allowed;
      background: var(--surface-muted);
      box-shadow: none;
    }

    .media {
      position: relative;
      aspect-ratio: 4 / 3;
      border-radius: var(--radius-md);
      background: var(--surface-muted);
      display: grid;
      place-items: center;
      overflow: hidden;
    }

    .media img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 8%;
    }

    /* Default image when the product has no photo: fills the frame like a real picture */
    .media img.default {
      object-fit: cover;
      padding: 0;
    }


    .card.out .media { opacity: 0.55; }

    .in-cart {
      position: absolute;
      top: 6px;
      right: 6px;
      min-width: 26px;
      height: 26px;
      padding: 0 7px;
      border-radius: 13px;
      background: var(--accent);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      display: grid;
      place-items: center;
      box-shadow: 0 4px 10px -2px rgba(196, 82, 15, 0.45);
    }

    .name {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--ink);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: calc(14px * 1.3 * 2);
    }

    .card.out .name { color: var(--ink-faint); }

    .footer {
      margin-top: auto;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px;
    }

    .price {
      font-size: 17px;
      font-weight: 800;
      color: var(--ink);
    }

    .price small {
      font-size: 11px;
      font-weight: 700;
      color: var(--ink-soft);
    }

    .stock {
      font-size: 11px;
      font-weight: 600;
      color: var(--ink-faint);
      white-space: nowrap;
    }

    .stock.low { color: var(--warn); }
    .stock.none { color: var(--danger); }
  `]
})
export class ProductCardComponent {
  private cartService = inject(CartService);

  private _product = signal<Product | null>(null);

  @Input({ required: true })
  set product(value: Product) { this._product.set(value); }
  get product(): Product { return this._product()!; }

  /** Units of this product already in the current ticket */
  inCart = computed(() => this.cartService.quantityOf(this._product()?.id ?? -1));


  stock(): number {
    return this.product.currentStock ?? 0;
  }

  add(): void {
    if (this.stock() > 0) {
      this.cartService.addToCart(this.product);
    }
  }
}
