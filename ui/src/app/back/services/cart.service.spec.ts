import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { MenuService } from './menu.service';
import { Product } from '../models/product.model';

describe('CartService', () => {
  let cart: CartService;
  let stock: Record<number, number>;

  const product = (id: number, retailPrice: number, currentStock: number): Product => ({
    id, code: 'P' + id, name: 'Produit ' + id, retailPrice, maxStock: 0, minStock: 0,
    currentStock, photo: null, categoryId: null, categoryName: null
  });

  beforeEach(() => {
    stock = {};
    TestBed.configureTestingModule({
      providers: [{
        provide: MenuService,
        useValue: { productById: (id: number) => id in stock ? { currentStock: stock[id] } : undefined }
      }]
    });
    cart = TestBed.inject(CartService);
  });

  it('rounds the total to the centime', () => {
    stock[1] = 10; stock[2] = 10;
    cart.addToCart(product(1, 0.1, 10));
    cart.addToCart(product(2, 0.2, 10));
    expect(cart.total()).toBe(0.3);
  });

  it('checks the current stock of the grid, not the snapshot taken when adding', () => {
    stock[1] = 5;
    cart.addToCart(product(1, 100, 5));
    stock[1] = 1; // another sale / sync lowered the stock meanwhile
    cart.incrementQuantity(1);
    expect(cart.items()[0].quantity).toBe(1);
  });

  it('removes the line instead of keeping it at quantity 0', () => {
    stock[1] = 5;
    cart.addToCart(product(1, 100, 5));
    stock[1] = 0;
    cart.updateQuantity(1, 1);
    expect(cart.items().length).toBe(0);
  });

  it('refuses a product out of stock', () => {
    stock[1] = 0;
    cart.addToCart(product(1, 100, 0));
    expect(cart.items().length).toBe(0);
  });
});
