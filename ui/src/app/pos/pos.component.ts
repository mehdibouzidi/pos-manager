import { Component, OnInit, inject } from '@angular/core';
import { SidebarComponent } from '../ui/components/sidebar/sidebar.component';
import { ProductGridComponent } from '../ui/components/product-grid/product-grid.component';
import { TicketPanelComponent } from '../ui/components/ticket-panel/ticket-panel.component';
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
    TicketPanelComponent,
    PaymentModalComponent,
    OpenCaisseModalComponent,
    CloseCaisseModalComponent
  ],
  template: `
    <div class="page">
      <app-topbar />
      <div class="workspace">
        <app-sidebar />
        <main class="catalog">
          <app-product-grid />
        </main>
        <app-ticket-panel class="ticket" />
      </div>
    </div>
    <app-payment-modal />
    <app-open-caisse-modal />
    <app-close-caisse-modal />
  `,
  styles: [`
    .page {
      display: flex;
      flex-direction: column;
      height: 100dvh;
    }

    /* Categories | products | ticket, always visible: one tap per product, one tap to cash in */
    .workspace {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) clamp(300px, 28vw, 380px);
      gap: 16px;
      padding: 16px 16px 16px 12px;
    }

    .catalog {
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .ticket {
      min-height: 0;
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
