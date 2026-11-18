import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../../back/services/cart.service';
import { CaisseSessionService } from '../../../../backend/service/business/caisse-session.service';

/** Current ticket, always visible next to the product grid (no drawer to open between each item). */
@Component({
  selector: 'app-ticket-panel',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <aside class="ticket" aria-label="Ticket en cours">
      <header class="head">
        <div>
          <h2>Ticket en cours</h2>
          <span class="count num">
            {{ cartService.itemCount() }} article{{ cartService.itemCount() > 1 ? 's' : '' }}
          </span>
        </div>
        @if (cartService.items().length > 0) {
          <button class="clear" (click)="cartService.clearCart()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
            Vider
          </button>
        }
      </header>

      <div class="lines">
        @for (item of cartService.items(); track item.product.id) {
          <div class="line">
            <div class="line-top">
              <span class="line-name">{{ item.product.name }}</span>
              <span class="line-total num">{{ item.product.retailPrice * item.quantity | number:'1.2-2' }}</span>
            </div>
            <div class="line-bottom">
              <span class="line-unit num">{{ item.product.retailPrice | number:'1.2-2' }} Da / u</span>
              <div class="line-actions">
                <div class="stepper">
                  <button class="step" (click)="cartService.decrementQuantity(item.product.id)"
                          [disabled]="item.quantity <= 1" aria-label="Retirer une unité">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/></svg>
                  </button>
                  <span class="qty num">{{ item.quantity }}</span>
                  <button class="step" (click)="cartService.incrementQuantity(item.product.id)" aria-label="Ajouter une unité">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                </div>
                <button class="remove" (click)="cartService.removeFromCart(item.product.id)" aria-label="Supprimer la ligne">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/></svg>
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>
            </svg>
            <p>Le ticket est vide</p>
            <span>Touchez un produit pour l'ajouter, ou scannez son code.</span>
          </div>
        }
      </div>

      <footer class="foot">
        <div class="total">
          <span>Total</span>
          <span class="total-value num">{{ cartService.total() | number:'1.2-2' }}<small> Da</small></span>
        </div>
        @if (!caisseSessionService.currentSession()) {
          <button class="pay" (click)="caisseSessionService.showOpenModal()">Ouvrir la caisse</button>
        } @else {
          <button class="pay" [disabled]="cartService.items().length === 0" (click)="cartService.openPayment()">
            Encaisser
          </button>
        }
      </footer>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    .ticket {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 14px 14px 20px;
      border-bottom: 1px solid var(--line);
    }

    h2 {
      font-size: 18px;
      font-weight: 750;
      letter-spacing: -0.01em;
    }

    .count {
      font-size: 13px;
      color: var(--ink-faint);
      font-weight: 600;
    }

    .clear {
      height: var(--tap);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      border-radius: var(--radius-md);
      background: var(--surface-muted);
      font-size: 15px;
      font-weight: 700;
      color: var(--ink-soft);
      transition: background-color 0.15s, color 0.15s;
    }

    .clear:active { background: var(--danger-soft); color: var(--danger); }

    .lines {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 4px 12px;
    }

    .line {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px 4px;
      border-bottom: 1px dashed #ddd5cc;
      animation: line-in 0.2s ease-out;
    }

    .line:last-child { border-bottom: none; }

    @keyframes line-in {
      from { opacity: 0; transform: translateY(-4px); }
    }

    .line-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .line-name {
      min-width: 0;
      font-size: 16px;
      font-weight: 650;
      line-height: 1.3;
    }

    .line-total {
      flex: none;
      font-size: 16px;
      font-weight: 800;
    }

    .line-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .line-unit {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-faint);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .line-actions {
      flex: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Quantity: finger-sized − / + with the count between them */
    .stepper {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 3px;
      border-radius: 14px;
      background: var(--surface-muted);
    }

    .step {
      width: var(--tap);
      height: var(--tap);
      display: grid;
      place-items: center;
      border-radius: 11px;
      background: var(--surface);
      color: var(--ink);
      box-shadow: 0 1px 2px rgba(31, 27, 23, 0.1);
      transition: background-color 0.15s, color 0.15s;
    }

    .step:active:not(:disabled) { background: var(--accent-soft); color: var(--accent-ink); }

    .step:disabled {
      background: transparent;
      color: var(--ink-faint);
      box-shadow: none;
      cursor: default;
    }

    .qty {
      min-width: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 800;
    }

    /* Delete: its own button, red, apart from the stepper so it is never hit by mistake */
    .remove {
      width: var(--tap);
      height: var(--tap);
      margin-left: 4px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: var(--danger-soft);
      color: var(--danger);
      transition: background-color 0.15s, color 0.15s;
    }

    .remove:active { background: var(--danger); color: #fff; }

    .empty {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px;
      text-align: center;
      color: var(--ink-faint);
    }

    .empty p {
      font-size: 15px;
      font-weight: 700;
      color: var(--ink-soft);
      margin-top: 4px;
    }

    .empty span {
      font-size: 13px;
      max-width: 22ch;
      line-height: 1.45;
    }

    .foot {
      padding: 16px 20px 20px;
      border-top: 1px solid var(--line);
      background: var(--surface-muted);
    }

    .total {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 14px;
      font-size: 15px;
      font-weight: 600;
      color: var(--ink-soft);
    }

    .total-value {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--ink);
    }

    .total-value small {
      font-size: 14px;
      font-weight: 700;
      color: var(--ink-soft);
      letter-spacing: 0;
    }

    .pay {
      width: 100%;
      height: 64px;
      border-radius: var(--radius-md);
      background: var(--accent);
      color: #fff;
      font-size: 18px;
      font-weight: 750;
      box-shadow: 0 10px 20px -10px rgba(196, 82, 15, 0.7);
      transition: background-color 0.2s, box-shadow 0.2s, transform 0.1s;
    }

    .pay:active:not(:disabled) {
      background: var(--accent-strong);
    }

    .pay:disabled {
      background: var(--surface-sunken);
      color: var(--ink-faint);
      box-shadow: none;
      cursor: not-allowed;
    }
  `]
})
export class TicketPanelComponent {
  cartService = inject(CartService);
  caisseSessionService = inject(CaisseSessionService);
}
