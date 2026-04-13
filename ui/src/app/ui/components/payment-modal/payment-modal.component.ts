import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CartService } from '../../../back/services/cart.service';
import { MenuService } from '../../../back/services/menu.service';
import { SaleService, SaleRequest } from '../../../../backend/service/business/sale.service';
import { CaisseSessionService } from '../../../../backend/service/business/caisse-session.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  template: `
    @if (cartService.snackMessage()) {
      <div class="snackbar snackbar-success">{{ cartService.snackMessage() }}</div>
    }
    @if (cartService.isPaymentOpen()) {
      <div class="payment-overlay" (click)="cartService.closePayment()"></div>
      <div class="payment-modal">
        <div class="modal-header">
          <h2>Confirmer la commande</h2>
          <button class="close-btn" (click)="cartService.closePayment()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="order-summary">
          <div class="items-list">
            @for (item of cartService.items(); track item.product.id) {
              <div class="summary-item">
                <span class="item-qty">{{ item.quantity }}x</span>
                <span class="item-name">{{ item.product.name }}</span>
                <span class="item-total">{{ item.product.retailPrice * item.quantity | number:'1.0-2' }} Da</span>
              </div>
            }
          </div>
          
          <div class="totals">
            <div class="total-row grand-total">
              <span>Total</span>
              <span>{{ cartService.total() | number:'1.0-2' }} Da</span>
            </div>
          </div>
        </div>

        <button class="confirm-btn" (click)="confirmAndPrint()">
          Confirmer &amp; Imprimer le reçu
        </button>
      </div>
    }
  `,
  styles: [`
    .snackbar {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      padding: 14px 28px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      z-index: 2000;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      pointer-events: none;
      white-space: nowrap;
    }
    .snackbar-success {
      background: #16a34a;
      color: #fff;
    }

    .payment-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 1000;
    }

    .payment-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 420px;
      max-width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
      background: white;
      border-radius: var(--radius-xl);
      padding: 28px;
      z-index: 1001;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .modal-header h2 {
      font-size: 22px;
      font-weight: 700;
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

    .order-summary {
      background: var(--bg-light);
      border-radius: var(--radius-lg);
      padding: 16px;
      margin-bottom: 20px;
    }

    .items-list {
      margin-bottom: 16px;
      max-height: 200px;
      overflow-y: auto;
    }

    .summary-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed var(--border-color);
      font-size: 14px;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .item-qty {
      width: 36px;
      color: var(--primary-orange);
      font-weight: 600;
    }

    .item-name {
      flex: 1;
      color: var(--text-dark);
    }

    .item-total {
      font-weight: 600;
      color: var(--text-dark);
    }

    .totals {
      border-top: 2px solid var(--border-color);
      padding-top: 12px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 14px;
      color: var(--text-gray);
    }

    .total-row.grand-total {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-dark);
      border-top: 1px solid var(--border-color);
      margin-top: 8px;
      padding-top: 12px;
    }

    .payment-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px;
      background: #ecfdf5;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      color: #059669;
      font-weight: 600;
    }

    .cash-icon {
      font-size: 24px;
    }

    .confirm-btn {
      width: 100%;
      padding: 16px;
      background: var(--primary-orange);
      color: white;
      border-radius: var(--radius-md);
      font-size: 16px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .confirm-btn:hover {
      background: var(--primary-orange-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  `]
})
export class PaymentModalComponent {
  cartService = inject(CartService);
  private menuService = inject(MenuService);
  private saleService = inject(SaleService);
  private caisseSessionService = inject(CaisseSessionService);
  private logoBase64 = '';

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
  }

  confirmAndPrint(): void {
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

    this.saleService.add(saleRequest).subscribe({
      next: (response) => {
        this.menuService.reloadProducts();
        this.cartService.showSnack('Vente effectuée avec succès !');
        this.printAndClose(response.orderNumber, now, items, total);
      },
      error: () => this.printAndClose(0, now, items, total)
    });
  }

  private printAndClose(orderNumber: number, now: Date, items: any[], total: number): void {

    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket #${orderNumber}</title>
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
      <div class="order-number">COMMANDE #${orderNumber}</div>
      <div class="date-time">${now.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
      <div class="date-time">${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
    </div>

    <div class="items">
      ${items.map(item => `
        <div class="item">
          <div class="item-details">
            <div class="item-name">${item.product.name}</div>
            <div class="item-qty">${item.quantity} x ${item.product.retailPrice.toFixed(2)} Da</div>
          </div>
          <div class="item-price">${(item.product.retailPrice * item.quantity).toFixed(2)} Da</div>
        </div>
      `).join('')}
    </div>

    <div class="totals">
      <div class="total-row grand-total">
        <span>TOTAL :</span>
        <span>${total.toFixed(2)} Da</span>
      </div>
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
    this.cartService.closePayment();
    this.cartService.closeCart();
  }
}
