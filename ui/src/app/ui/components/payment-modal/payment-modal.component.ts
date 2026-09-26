import { Component, ElementRef, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../../back/services/cart.service';
import { MenuService } from '../../../back/services/menu.service';
import { SaleService, SaleRequest } from '../../../../backend/service/business/sale.service';
import { CaisseSessionService } from '../../../../backend/service/business/caisse-session.service';

/** Algerian banknotes, used for the quick "received" buttons */
const NOTES = [200, 500, 1000, 2000];

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    @if (cartService.snackMessage()) {
      <div class="toast" role="status">{{ cartService.snackMessage() }}</div>
    }
    @if (cartService.isPaymentOpen()) {
      <div class="overlay" (click)="close()"></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="pay-title">
        <header class="head">
          <h2 id="pay-title">Encaissement</h2>
          <button class="icon-btn" (click)="close()" aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>

        <div class="due">
          <span>À payer</span>
          <strong class="num">{{ cartService.total() | number:'1.2-2' }}<small> DA</small></strong>
          <span class="meta num">{{ cartService.itemCount() }} article{{ cartService.itemCount() > 1 ? 's' : '' }} · espèces</span>
        </div>

        <label class="field">
          <span>Montant reçu</span>
          <div class="input-wrap">
            <input #receivedInput class="num" type="number" inputmode="decimal" min="0" step="0.01"
                   placeholder="Montant exact"
                   [value]="received() ?? ''"
                   (input)="setReceived(receivedInput.value)"
                   (keydown.enter)="confirmAndPrint()" />
            <span class="suffix">DA</span>
          </div>
        </label>

        <div class="quick">
          <button [class.on]="received() === null" (click)="received.set(null)">Exact</button>
          @for (amount of quickAmounts(); track amount) {
            <button class="num" [class.on]="received() === amount" (click)="received.set(amount)">
              {{ amount | number:'1.0-0' }}
            </button>
          }
        </div>

        <div class="change" [class.short]="missing() > 0">
          @if (missing() > 0) {
            <span>Manque</span>
            <strong class="num">{{ missing() | number:'1.2-2' }} DA</strong>
          } @else {
            <span>À rendre</span>
            <strong class="num">{{ change() | number:'1.2-2' }} DA</strong>
          }
        </div>

        @if (saleError()) {
          <div class="error" role="alert">{{ saleError() }}</div>
        }

        <button class="confirm" (click)="confirmAndPrint()" [disabled]="submitting() || missing() > 0">
          {{ submitting() ? 'Enregistrement…' : 'Valider et imprimer le ticket' }}
        </button>
      </div>
    }
  `,
  styles: [`
    .toast {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      z-index: var(--z-toast);
      padding: 12px 20px;
      border-radius: var(--radius-md);
      background: var(--ink);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      white-space: nowrap;
      animation: toast-in 0.25s ease-out;
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translate(-50%, 8px); }
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(31, 27, 23, 0.45);
      z-index: var(--z-overlay);
      animation: fade 0.2s ease-out;
    }

    @keyframes fade { from { opacity: 0; } }

    .dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(440px, calc(100vw - 32px));
      max-height: calc(100dvh - 32px);
      overflow-y: auto;
      z-index: var(--z-modal);
      background: var(--surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: 20px 24px 24px;
      animation: pop 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2);
    }

    @keyframes pop {
      from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    h2 {
      font-size: 18px;
      font-weight: 700;
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: var(--ink-soft);
      transition: background-color 0.2s;
    }

    .icon-btn:hover { background: var(--surface-muted); }

    .due {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 18px 16px;
      background: var(--surface-muted);
      border-radius: var(--radius-lg);
      margin-bottom: 18px;
    }

    .due > span:first-child {
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-soft);
    }

    .due strong {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -0.03em;
    }

    .due strong small {
      font-size: 16px;
      color: var(--ink-soft);
      letter-spacing: 0;
    }

    .meta {
      font-size: 12px;
      color: var(--ink-faint);
      font-weight: 600;
    }

    .field > span {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-soft);
      margin-bottom: 6px;
    }

    .input-wrap {
      display: flex;
      align-items: center;
      height: 52px;
      padding: 0 14px;
      border-radius: var(--radius-md);
      background: var(--surface);
      box-shadow: inset 0 0 0 1.5px var(--line);
      transition: box-shadow 0.2s;
    }

    .input-wrap:focus-within { box-shadow: inset 0 0 0 2px var(--accent); }

    .input-wrap input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font-size: 22px;
      font-weight: 700;
      color: var(--ink);
    }

    .input-wrap input::placeholder {
      font-size: 16px;
      font-weight: 500;
      color: var(--ink-faint);
    }

    .suffix {
      font-weight: 700;
      color: var(--ink-faint);
    }

    .quick {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
      gap: 8px;
      margin: 10px 0 16px;
    }

    .quick button {
      height: 42px;
      border-radius: var(--radius-sm);
      background: var(--surface-muted);
      font-weight: 700;
      font-size: 14px;
      color: var(--ink-soft);
      transition: background-color 0.15s, color 0.15s;
    }

    .quick button:hover { background: var(--surface-sunken); color: var(--ink); }

    .quick button.on {
      background: var(--accent-soft);
      color: var(--accent-ink);
      box-shadow: inset 0 0 0 1.5px var(--accent);
    }

    .change {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      background: var(--ok-soft);
      color: var(--ok);
      font-weight: 600;
      margin-bottom: 16px;
    }

    .change strong {
      font-size: 22px;
      font-weight: 800;
    }

    .change.short {
      background: var(--danger-soft);
      color: var(--danger);
    }

    .error {
      margin-bottom: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      background: var(--danger-soft);
      color: var(--danger);
      font-size: 14px;
      font-weight: 600;
    }

    .confirm {
      width: 100%;
      height: 56px;
      border-radius: var(--radius-md);
      background: var(--accent);
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      box-shadow: 0 10px 20px -10px rgba(196, 82, 15, 0.7);
      transition: background-color 0.2s;
    }

    .confirm:hover:not(:disabled) { background: var(--accent-strong); }

    .confirm:disabled {
      background: var(--surface-sunken);
      color: var(--ink-faint);
      box-shadow: none;
      cursor: not-allowed;
    }
  `]
})
export class PaymentModalComponent {
  cartService = inject(CartService);
  private menuService = inject(MenuService);
  private saleService = inject(SaleService);
  private caisseSessionService = inject(CaisseSessionService);
  private logoBase64 = '';

  @ViewChild('receivedInput') receivedInput?: ElementRef<HTMLInputElement>;

  /** Blocks double submission: each click would otherwise create its own sale. */
  submitting = signal(false);
  saleError = signal<string | null>(null);
  /** Cash handed over by the customer; null = exact amount */
  received = signal<number | null>(null);

  change = computed(() => {
    const r = this.received();
    return r === null ? 0 : Math.max(0, Math.round((r - this.cartService.total()) * 100) / 100);
  });

  missing = computed(() => {
    const r = this.received();
    return r === null ? 0 : Math.max(0, Math.round((this.cartService.total() - r) * 100) / 100);
  });

  /** Next banknote amounts at or above the total (e.g. total 1 775 → 2 000, 2 500, 3 000…) */
  quickAmounts = computed(() => {
    const total = this.cartService.total();
    const amounts = new Set<number>();
    for (const note of NOTES) {
      const rounded = Math.ceil(total / note) * note;
      for (const amount of [rounded, rounded + note]) {
        if (amount > total) amounts.add(amount);
      }
    }
    return [...amounts].sort((a, b) => a - b).slice(0, 4);
  });

  constructor() {
    fetch('assets/logo/logoElAfia.png')
      .then(r => r.blob())
      .then(blob => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }))
      .then(b64 => this.logoBase64 = b64)
      .catch(() => {});

    // Fresh state and focus on the amount field each time the dialog opens
    effect(() => {
      if (this.cartService.isPaymentOpen()) {
        this.received.set(null);
        this.saleError.set(null);
        setTimeout(() => this.receivedInput?.nativeElement.focus());
      }
    }, { allowSignalWrites: true });
  }

  setReceived(value: string): void {
    const n = parseFloat(value.replace(',', '.'));
    this.received.set(Number.isFinite(n) && n > 0 ? n : null);
  }

  close(): void {
    if (this.submitting()) return;
    this.cartService.closePayment();
  }

  confirmAndPrint(): void {
    if (this.submitting() || this.missing() > 0) return;
    if (!this.caisseSessionService.currentSession()) {
      this.cartService.showSnack('Ouvrez d\'abord la caisse pour effectuer une vente.');
      return;
    }

    const now = new Date();
    const items = this.cartService.items();
    const total = this.cartService.total();

    const saleRequest: SaleRequest = {
      totalAmount: total,
      paymentMethod: 'CASH',
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.retailPrice
      }))
    };

    this.submitting.set(true);
    this.saleError.set(null);
    this.saleService.add(saleRequest).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.caisseSessionService.recordSale(total, response.orderNumber);
        if (response.offline) {
          // Update local stock immediately — no backend call possible
          this.menuService.applyOfflineSale(saleRequest.items);
          this.cartService.showSnack('Vente enregistrée hors ligne. Elle sera synchronisée au retour du réseau.');
        } else {
          this.menuService.reloadProducts();
          this.cartService.showSnack(`Vente n° ${response.orderNumber} enregistrée`);
        }
        this.printAndClose(response.orderNumber, now, items, total, response.offline ?? false, this.received());
      },
      // Sale rejected by the server (network failures are already queued offline by SaleService):
      // no ticket, cart kept so the cashier can fix and retry.
      error: (err) => {
        this.submitting.set(false);
        this.saleError.set(err?.error?.message ?? 'La vente n\'a pas pu être enregistrée. Aucun ticket imprimé.');
      }
    });
  }

  private printAndClose(orderNumber: number, now: Date, items: any[], total: number, offline = false,
                        received: number | null = null): void {
    const orderLabel = `${orderNumber}`;
    const change = received !== null ? Math.max(0, received - total) : null;

    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket #${orderLabel}</title>
  <style>
    @page { size: 72mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html {
      height: fit-content;
    }
    body {
      font-family: 'Courier New', monospace;
      width: 72mm;
      height: fit-content;
      margin: 0;
      padding: 3mm 4mm;
      background: white;
      font-size: 10px;
      line-height: 1.4;
    }
    .ticket { width: 72mm; }
    .header {
      text-align: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px dashed #000;
    }
    .logo { font-size: 20px; }
    .store-name { font-size: 13px; font-weight: bold; margin: 3px 0; }
    .store-info { font-size: 9px; color: #333; }
    .order-info {
      text-align: center;
      margin: 6px 0;
      padding: 6px 0;
      border-bottom: 1px dashed #000;
    }
    .order-number { font-size: 12px; font-weight: bold; }
    .date-time { font-size: 9px; margin-top: 3px; }
    .items { margin: 8px 0; }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 3px 0;
      font-size: 10px;
      border-bottom: 1px dotted #ccc;
    }
    .item:last-child { border-bottom: none; }
    .item-details { flex: 1; padding-right: 4px; }
    .item-name { font-weight: bold; word-break: break-word; }
    .item-qty { color: #555; font-size: 9px; }
    .item-price { text-align: right; white-space: nowrap; font-weight: bold; }
    .totals {
      border-top: 1px dashed #000;
      padding-top: 6px;
      margin-top: 6px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      font-size: 10px;
    }
    .grand-total {
      font-size: 13px;
      font-weight: bold;
      border-top: 1px solid #000;
      margin-top: 5px;
      padding-top: 5px;
    }
    .payment-method {
      text-align: center;
      margin: 8px 0;
      padding: 5px;
      border: 1px dashed #000;
      font-weight: bold;
      font-size: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #000;
      font-size: 9px;
    }
    .thank-you { font-size: 11px; font-weight: bold; margin-bottom: 3px; }
    @media print {
      body { width: 72mm; margin: 0; }
      .ticket { width: 72mm; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      ${this.logoBase64 ? `<img src="${this.logoBase64}" style="width:60px;height:60px;object-fit:contain;margin-bottom:4px;" alt="Logo">` : ''}
      <div class="store-name">SARL El Afia</div>
    </div>

    <div class="order-info">
      ${offline ? '<div style="background:#fef3c7;color:#92400e;text-align:center;padding:3px 6px;font-size:9px;font-weight:bold;border-radius:3px;margin-bottom:4px;">MODE HORS LIGNE — BON DE CAISSE</div>' : ''}
      <div class="order-number">COMMANDE #${orderLabel}</div>
      <div class="date-time">${now.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
      <div class="date-time">${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
    </div>

    <div class="items">
      ${items.map(item => `
        <div class="item">
          <div class="item-details">
            <div class="item-name">${escapeHtml(item.product.name)}</div>
            <div class="item-qty">${item.quantity} x ${da(item.product.retailPrice)}</div>
          </div>
          <div class="item-price">${da(item.product.retailPrice * item.quantity)}</div>
        </div>
      `).join('')}
    </div>

    <div class="totals">
      <div class="total-row grand-total">
        <span>TOTAL :</span>
        <span>${da(total)}</span>
      </div>
      ${received !== null ? `
      <div class="total-row"><span>Reçu :</span><span>${da(received)}</span></div>
      <div class="total-row"><span>Rendu :</span><span>${da(change!)}</span></div>` : ''}
    </div>

    <div class="payment-method">
      PAIEMENT EN ESPÈCES
    </div>

    <div class="footer">
      <div class="thank-you">Merci pour votre commande !</div>
      <div>Conservez ce ticket</div>
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank', 'width=250,height=500');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    }

    this.cartService.clearCart();
    this.close();
  }
}

const daFormat = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Amount formatted for the printed ticket: "1 450,00 DA". */
function da(value: number): string {
  return `${daFormat.format(value)} DA`;
}

/** Product names come from the back-office: never inject them as raw HTML in the ticket window. */
function escapeHtml(value: string): string {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
