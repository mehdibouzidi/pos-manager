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
      [class.picked]="inCart() > 0"
      [disabled]="stock() <= 0"
      [attr.aria-label]="'Ajouter ' + product.name"
      (click)="add()"
    >
      <span class="media">
        @if (product.photo) {
          <img [src]="'data:image/jpeg;base64,' + product.photo" alt="">
        } @else {
          <img class="default" src="assets/img/placeholder-product.svg" alt="">
        }
        @if (inCart() > 0) {
          <span class="in-cart num" aria-label="Quantité dans le ticket">×{{ inCart() }}</span>
        }
        @if (stock() <= 0) {
          <span class="sold-out">Épuisé</span>
        }
      </span>

      <span class="body">
        <span class="name">{{ product.name }}</span>
        <span class="footer">
          <span class="price num">{{ product.retailPrice | number:'1.2-2' }}<small>Da</small></span>
          @if (stock() > 0) {
            <span class="stock num" [class.low]="stock() <= 5">{{ stock() }} en stock</span>
          }
        </span>
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: block;
      --m-in: 140ms;
      --m-out: 200ms;
      --m-press: 90ms;
      --m-image: 600ms;
      --m-ease: cubic-bezier(.2, .8, .2, 1);
    }

    .card {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      text-align: left;
      outline: 2px solid transparent;
      outline-offset: 6px;
      transition:
        transform 180ms var(--m-ease),
        border-color var(--m-out) var(--m-ease),
        box-shadow var(--m-out) var(--m-ease),
        outline-offset var(--m-out) var(--m-ease);
    }

    @media (hover: hover) and (pointer: fine) {
      .card:hover:not(:disabled) {
        transform: translateY(-2px);
        border-color: #d3cdc6;
        box-shadow: 0 14px 24px -14px rgba(31, 27, 23, 0.18);
        transition-duration: 180ms, var(--m-in), var(--m-in), var(--m-out);
      }
      .card:hover:not(:disabled) .media img { transform: scale(1.03); }
    }

    .card:active:not(:disabled) {
      transform: translateY(1px) scale(0.985);
      transition-duration: var(--m-press);
    }

    .card:focus-visible {
      outline-color: var(--accent);
      outline-offset: 2px;
    }

    /* Already in the ticket: accent edge so the cashier sees it at a glance */
    .card.picked {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    @media (hover: hover) and (pointer: fine) {
      .card.picked:hover:not(:disabled) {
        border-color: var(--accent);
        box-shadow: 0 0 0 1px var(--accent), 0 14px 24px -14px rgba(31, 27, 23, 0.18);
      }
    }

    .card.out {
      cursor: not-allowed;
      background: var(--surface-muted);
    }

    .media {
      position: relative;
      display: block;
      aspect-ratio: 1 / 1;
      background: var(--surface-muted);
      overflow: hidden;
    }

    .media img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 5%;
      transition: transform var(--m-image) var(--m-ease);
    }

    .media img.default {
      object-fit: cover;
      padding: 0;
    }

    .card.out .media img {
      filter: grayscale(1);
      opacity: 0.45;
    }

    .in-cart {
      position: absolute;
      top: 10px;
      right: 10px;
      min-width: 34px;
      height: 28px;
      padding: 0 9px;
      border-radius: 14px;
      background: var(--accent);
      color: #fff;
      font-size: 14px;
      font-weight: 800;
      display: grid;
      place-items: center;
    }

    .sold-out {
      position: absolute;
      left: 10px;
      bottom: 10px;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--danger-soft);
      color: var(--danger);
      font-size: 12px;
      font-weight: 700;
    }

    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px 14px 14px;
      border-top: 1px solid var(--line);
    }

    .name {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--ink);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: calc(15px * 1.3 * 2);
    }

    .card.out .name { color: var(--ink-faint); }

    .footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .price {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--ink);
      white-space: nowrap;
    }

    .price small {
      margin-left: 3px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0;
      color: var(--ink-soft);
    }

    .card.out .price { color: var(--ink-faint); }

    .stock {
      padding: 3px 8px;
      border-radius: 999px;
      background: var(--surface-muted);
      font-size: 12px;
      font-weight: 600;
      color: var(--ink-soft);
      white-space: nowrap;
    }

    .stock.low {
      background: var(--warn-soft);
      color: var(--warn);
    }

    @media (prefers-reduced-motion: reduce) {
      .card, .media img { transition: none; }
      .card:hover:not(:disabled), .card:active:not(:disabled) { transform: none; }
      .card:hover:not(:disabled) .media img { transform: none; }
    }
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
