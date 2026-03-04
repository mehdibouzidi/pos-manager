import { Component } from '@angular/core';
import { SidebarComponent } from './ui/components/sidebar/sidebar.component';
import { PromoBannerComponent } from './ui/components/promo-banner/promo-banner.component';
import { ProductGridComponent } from './ui/components/product-grid/product-grid.component';
import { CartButtonComponent } from './ui/components/cart-button/cart-button.component';
import { CartSidebarComponent } from './ui/components/cart-sidebar/cart-sidebar.component';
import { PaymentModalComponent } from './ui/components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SidebarComponent, 
    PromoBannerComponent, 
    ProductGridComponent,
    CartButtonComponent,
    CartSidebarComponent,
    PaymentModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'KioskUI';
}
