import { Component } from '@angular/core';
import { SidebarComponent } from '../ui/components/sidebar/sidebar.component';
import { PromoBannerComponent } from '../ui/components/promo-banner/promo-banner.component';
import { ProductGridComponent } from '../ui/components/product-grid/product-grid.component';
import { CartButtonComponent } from '../ui/components/cart-button/cart-button.component';
import { CartSidebarComponent } from '../ui/components/cart-sidebar/cart-sidebar.component';
import { PaymentModalComponent } from '../ui/components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    SidebarComponent,
    PromoBannerComponent,
    ProductGridComponent,
    CartButtonComponent,
    CartSidebarComponent,
    PaymentModalComponent
  ],
  template: `
    <div class="kiosk-container">
      <app-sidebar />
      <main class="main-content">
        <app-promo-banner />
        <app-product-grid />
      </main>
    </div>
    <app-cart-button />
    <app-cart-sidebar />
    <app-payment-modal />
  `,
  styles: [`
    .kiosk-container {
      display: flex;
      height: 100vh;
      padding: 20px;
      gap: 24px;
      background: var(--bg-light);
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
      overflow: hidden;
    }
  `]
})
export class PosComponent {}
