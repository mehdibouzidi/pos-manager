import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { MenuService } from './menu.service';

/** Amounts are rounded to the centime to avoid floating point artefacts (0.1 + 0.2). */
const round2 = (value: number) => Math.round(value * 100) / 100;

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private menuService = inject(MenuService);
  private _items = signal<CartItem[]>([]);
  private _isPaymentOpen = signal<boolean>(false);
  private _snackMessage = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly isPaymentOpen = this._isPaymentOpen.asReadonly();
  readonly snackMessage = this._snackMessage.asReadonly();

  readonly itemCount = computed(() => 
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    round2(this._items().reduce((sum, item) => sum + (item.product.retailPrice * item.quantity), 0))
  );

  readonly total = computed(() => this.subtotal());

  /** Quantity of a product in the current ticket (reactive when read inside a computed / template). */
  quantityOf(productId: number): number {
    return this._items().find(item => item.product.id === productId)?.quantity ?? 0;
  }

  /**
   * Stock of the product as currently known by the grid (refreshed after each sale / sync),
   * not the snapshot taken when the product was added to the cart.
   */
  private availableStock(product: Product): number {
    return Math.max(0, this.menuService.productById(product.id)?.currentStock ?? product.currentStock ?? 0);
  }

  addToCart(product: Product): void {
    const currentItems = this._items();
    const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (this.availableStock(product) <= 0) {
      this.showSnack(`Stock insuffisant pour "${product.name}"`);
      return;
    }

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      if (existing.quantity >= this.availableStock(product)) {
        this.showSnack(`Stock insuffisant pour "${product.name}"`);
        return;
      }
      const updatedItems = [...currentItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1
      };
      this._items.set(updatedItems);
    } else {
      this._items.set([...currentItems, { product, quantity: 1 }]);
    }
  }

  removeFromCart(productId: number): void {
    this._items.set(this._items().filter(item => item.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const item = this._items().find(i => i.product.id === productId);
    if (item && quantity > this.availableStock(item.product)) {
      quantity = this.availableStock(item.product);
      this.showSnack(`Stock insuffisant pour "${item.product.name}"`);
    }
    // No line left at quantity 0 (e.g. stock went down to 0 meanwhile)
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const updatedItems = this._items().map(item => 
      item.product.id === productId 
        ? { ...item, quantity } 
        : item
    );
    this._items.set(updatedItems);
  }

  incrementQuantity(productId: number): void {
    const item = this._items().find(i => i.product.id === productId);
    if (item) {
      if (item.quantity >= this.availableStock(item.product)) {
        this.showSnack(`Stock insuffisant pour "${item.product.name}"`);
        return;
      }
      this.updateQuantity(productId, item.quantity + 1);
    }
  }

  decrementQuantity(productId: number): void {
    const item = this._items().find(i => i.product.id === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity - 1);
    }
  }

  clearCart(): void {
    this._items.set([]);
  }

  private snackTimer: ReturnType<typeof setTimeout> | undefined;

  showSnack(message: string): void {
    this._snackMessage.set(message);
    // Restart the timer: an older message's timer must not hide the new one early
    clearTimeout(this.snackTimer);
    this.snackTimer = setTimeout(() => this._snackMessage.set(null), 3000);
  }

  openPayment(): void {
    this._isPaymentOpen.set(true);
  }

  closePayment(): void {
    this._isPaymentOpen.set(false);
  }
}
