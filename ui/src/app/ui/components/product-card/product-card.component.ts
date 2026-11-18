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
      </span>

      <span class="body">
        <span class="name">{{ product.name }}</span>
        @if (stock() <= 0) {
          <span class="chip chip--none">Épuisé</span>
        } @else {
          <span class="chip num" [class.chip--low]="stock() <= 5">{{ stock() }} en stock</span>
        }
      </span>

      <span class="footer">
        <span class="price num">{{ product.retailPrice | number:'1.2-2' }}<small>Da</small></span>
        <span class="add" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </span>
      </span>
    </button>
  `,
  styles: [`
    /* Touchscreen first: the whole card is the tap target, feedback comes from the press,
       hover is only a bonus for a mouse. */
    :host {
      display: block;
      --m-in: 140ms;
      --m-out: 200ms;
      --m-press: 90ms;
      --m-image: 600ms;
      --m-ease: cubic-bezier(.2, .8, .2, 1);
      --card-tint: #fdf1e8;
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
      box-shadow: 0 1px 2px rgba(60, 40, 20, 0.06), 0 4px 12px -8px rgba(60, 40, 20, 0.12);
      text-align: left;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
      outline: 2px solid transparent;
      outline-offset: 6px;
      transition:
        transform 180ms var(--m-ease),
        border-color var(--m-out) var(--m-ease),
        box-shadow var(--m-out) var(--m-ease),
        outline-offset var(--m-out) var(--m-ease);
    }

    /* Press: the finger needs a clear answer, on every pointer */
    .card:active:not(:disabled) {
      transform: scale(0.97);
      border-color: var(--accent);
      transition-duration: var(--m-press);
    }

    .card:active:not(:disabled) .add {
      background: var(--accent-strong);
      transform: scale(0.92);
    }

    @media (hover: hover) and (pointer: fine) {
      .card:hover:not(:disabled) {
        transform: translateY(-2px);
        border-color: #d3cdc6;
        box-shadow: 0 14px 24px -14px rgba(31, 27, 23, 0.22);
        transition-duration: 180ms, var(--m-in), var(--m-in), var(--m-out);
      }
      .card:hover:not(:disabled) .media img { transform: scale(1.03); }
      .card:active:not(:disabled) { transform: translateY(1px) scale(0.985); }
    }

    .card:focus-visible {
      outline-color: var(--accent);
      outline-offset: 2px;
    }

    /* Already in the ticket */
    .card.picked {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent), 0 6px 16px -10px rgba(196, 82, 15, 0.5);
    }

    .card.out {
      cursor: not-allowed;
      background: var(--surface-muted);
      box-shadow: none;
    }

    /* Photo */
    .media {
      position: relative;
      display: block;
      aspect-ratio: 1 / 1;
      background: var(--card-tint);
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

    .card.out .media { background: var(--surface-sunken); }

    .card.out .media img {
      filter: grayscale(1);
      opacity: 0.45;
    }

    /* Title + stock */
    .body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 14px 12px;
    }

    /* Stock: green, amber when low, red when gone */
    .chip {
      height: 26px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px 0 9px;
      border-radius: 13px;
      background: var(--ok-soft);
      color: var(--ok);
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .chip::before {
      content: '';
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }

    .chip--low { background: var(--warn-soft); color: var(--warn); }
    .chip--none { background: var(--danger-soft); color: var(--danger); }

    .in-cart {
      position: absolute;
      top: 8px;
      right: 8px;
      min-width: 40px;
      height: 32px;
      padding: 0 10px;
      border-radius: 16px;
      background: var(--accent);
      color: #fff;
      font-size: 15px;
      font-weight: 800;
      display: grid;
      place-items: center;
      box-shadow: 0 4px 10px -3px rgba(196, 82, 15, 0.55);
    }

    /* Title */
    .name {
      font-size: 16px;
      font-weight: 650;
      line-height: 1.3;
      color: var(--ink);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: calc(16px * 1.3 * 2);
    }

    .card.out .name { color: var(--ink-faint); }

    /* Price band, set apart from the title by a ticket-like dashed rule */
    .footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 10px 10px 14px;
      border-top: 1.5px dashed #ddd5cc;
      background: var(--surface);
    }

    .card.picked .footer { background: var(--accent-soft); border-top-color: #f3cfb6; }
    .card.out .footer { background: transparent; }

    .price {
      font-size: 21px;
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

    .card.picked .price { color: var(--accent-ink); }
    .card.out .price { color: var(--ink-faint); }

    /* The add affordance: big enough to read as a button under a finger */
    .add {
      flex: none;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--accent);
      color: #fff;
      box-shadow: 0 4px 10px -4px rgba(196, 82, 15, 0.6);
      transition: transform var(--m-press) var(--m-ease), background var(--m-out) var(--m-ease);
    }

    .card.out .add {
      background: var(--surface-sunken);
      color: var(--ink-faint);
      box-shadow: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .card, .media img, .add { transition: none; }
      .card:hover:not(:disabled), .card:active:not(:disabled) { transform: none; }
      .card:hover:not(:disabled) .media img, .card:active:not(:disabled) .add { transform: none; }
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
