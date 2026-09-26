import { Component, OnInit, inject } from '@angular/core';
import { SidebarComponent } from '../ui/components/sidebar/sidebar.component';
import { ProductGridComponent } from '../ui/components/product-grid/product-grid.component';
import { CartButtonComponent } from '../ui/components/cart-button/cart-button.component';
import { CartSidebarComponent } from '../ui/components/cart-sidebar/cart-sidebar.component';
import { PaymentModalComponent } from '../ui/components/payment-modal/payment-modal.component';
import { TopbarComponent } from '../ui/components/topbar/topbar.component';
import { OpenCaisseModalComponent } from '../ui/components/open-caisse-modal/open-caisse-modal.component';
import { CloseCaisseModalComponent } from '../ui/components/close-caisse-modal/close-caisse-modal.component';
import { CaisseSessionService } from '../../backend/service/business/caisse-session.service';
import { MenuService } from '../back/services/menu.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    TopbarComponent,
    SidebarComponent,
    ProductGridComponent,
    CartButtonComponent,
    CartSidebarComponent,
    PaymentModalComponent,
    OpenCaisseModalComponent,
    CloseCaisseModalComponent
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
    <app-open-caisse-modal />
    <app-close-caisse-modal />
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
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
      overflow: hidden;
    }
  `]
})
export class PosComponent implements OnInit {
  private caisseSessionService = inject(CaisseSessionService);
  private menuService = inject(MenuService);

  ngOnInit(): void {
    // Refresh product catalogue (including currentStock) each time the POS screen loads
    this.menuService.loadData();
    // Current session: synced offline operations first, local snapshot when the server is unreachable
    this.caisseSessionService.loadCurrent();
  }
}
