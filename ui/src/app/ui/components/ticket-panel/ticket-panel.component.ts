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
          <button class="clear" (click)="cartService.clearCart()">Vider</button>
        }
      </header>

      <div class="lines">
        @for (item of cartService.items(); track item.product.id) {
          <div class="line">
            <div class="line-main">
              <span class="line-name">{{ item.product.name }}</span>
              <span class="line-unit num">{{ item.product.retailPrice | number:'1.2-2' }} DA / u</span>
            </div>
            <div class="line-side">
              <span class="line-total num">{{ item.product.retailPrice * item.quantity | number:'1.2-2' }}</span>
              <div class="stepper">
                <button (click)="cartService.decrementQuantity(item.product.id)"
                        [attr.aria-label]="item.quantity > 1 ? 'Retirer une unité' : 'Supprimer la ligne'">
                  @if (item.quantity > 1) {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>
                  } @else {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                  }
                </button>
                <span class="qty num">{{ item.quantity }}</span>
                <button (click)="cartService.incrementQuantity(item.product.id)" aria-label="Ajouter une unité">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
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
          <span class="total-value num">{{ cartService.total() | number:'1.2-2' }}<small> DA</small></span>
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
      align-items: flex-start;
      justify-content: space-between;
      padding: 18px 20px 14px;
      border-bottom: 1px solid var(--line);
    }

    h2 {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .count {
      font-size: 12px;
      color: var(--ink-faint);
      font-weight: 600;
    }

    .clear {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-soft);
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      transition: background-color 0.2s, color 0.2s;
    }

    .clear:hover {
      background: var(--danger-soft);
      color: var(--danger);
    }

    .lines {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 6px 12px;
    }

    .line {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 8px;
      border-bottom: 1px dashed var(--line);
      animation: line-in 0.2s ease-out;
    }

    @keyframes line-in {
      from { opacity: 0; transform: translateY(-4px); }
    }

    .line-main {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .line-name {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
    }

    .line-unit {
      font-size: 12px;
      color: var(--ink-faint);
    }

    .line-side {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }

    .line-total {
      font-size: 14px;
      font-weight: 700;
    }

    .stepper {
      display: flex;
      align-items: center;
      background: var(--surface-muted);
      border-radius: 10px;
      padding: 2px;
    }

    .stepper button {
      width: 34px;
      height: 32px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      color: var(--ink-soft);
      transition: background-color 0.15s, color 0.15s;
    }

    .stepper button:hover {
      background: var(--surface);
      color: var(--ink);
    }

    .qty {
      min-width: 28px;
      text-align: center;
      font-size: 14px;
      font-weight: 700;
    }

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
      height: 56px;
      border-radius: var(--radius-md);
      background: var(--accent);
      color: #fff;
      font-size: 17px;
      font-weight: 700;
      box-shadow: 0 10px 20px -10px rgba(196, 82, 15, 0.7);
      transition: background-color 0.2s, box-shadow 0.2s, transform 0.1s;
    }

    .pay:hover:not(:disabled) {
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
