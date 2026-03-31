import { Component } from '@angular/core';
import { SidebarComponent } from '../ui/components/sidebar/sidebar.component';
import { ProductGridComponent } from '../ui/components/product-grid/product-grid.component';
import { CartButtonComponent } from '../ui/components/cart-button/cart-button.component';
import { CartSidebarComponent } from '../ui/components/cart-sidebar/cart-sidebar.component';
import { PaymentModalComponent } from '../ui/components/payment-modal/payment-modal.component';
import { TopbarComponent } from '../ui/components/topbar/topbar.component';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    TopbarComponent,
    SidebarComponent,
    ProductGridComponent,
    CartButtonComponent,
    CartSidebarComponent,
    PaymentModalComponent
  ],
  template: `
    <div class="page-wrapper">
      <app-topbar />
      <div class="kiosk-container">
        <app-sidebar />
        <main class="main-content">
          <app-product-grid />
        </main>
      </div>
    </div>
    <app-cart-button />
    <app-cart-sidebar />
    <app-payment-modal />
  `,
  styles: [`
    .page-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .kiosk-container {
      display: flex;
      flex: 1;
      padding: 20px;
      gap: 24px;
      background: var(--bg-light);
      overflow: hidden;
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
