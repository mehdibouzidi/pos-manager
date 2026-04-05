import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _items = signal<CartItem[]>([]);
  private _isCartOpen = signal<boolean>(false);
  private _isPaymentOpen = signal<boolean>(false);
  private _snackMessage = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly isCartOpen = this._isCartOpen.asReadonly();
  readonly isPaymentOpen = this._isPaymentOpen.asReadonly();
  readonly snackMessage = this._snackMessage.asReadonly();

  readonly itemCount = computed(() => 
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotal = computed(() => 
    this._items().reduce((sum, item) => sum + (item.product.retailPrice * item.quantity), 0)
  );

  readonly total = computed(() => this.subtotal());

  addToCart(product: Product): void {
    const currentItems = this._items();
    const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingIndex >= 0) {
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

  showSnack(message: string): void {
    this._snackMessage.set(message);
    setTimeout(() => this._snackMessage.set(null), 3000);
  }

  toggleCart(): void {
    this._isCartOpen.set(!this._isCartOpen());
  }

  openCart(): void {
    this._isCartOpen.set(true);
  }

  closeCart(): void {
    this._isCartOpen.set(false);
  }

  openPayment(): void {
    this._isPaymentOpen.set(true);
  }

  closePayment(): void {
    this._isPaymentOpen.set(false);
  }

  processPayment(paymentMethod: string): Promise<boolean> {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        this.clearCart();
        this.closePayment();
        this.closeCart();
        resolve(true);
      }, 2000);
    });
  }
}
