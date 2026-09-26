import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { MenuService } from '../../../back/services/menu.service';
import { CartService } from '../../../back/services/cart.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    <section class="catalog">
      <header class="bar">
        <h1 class="title">
          @if (menuService.query()) {
            Résultats <span class="hint num">{{ menuService.filteredProducts().length }}</span>
          } @else {
            {{ menuService.getSelectedCategory()?.name ?? 'Produits' }}
          }
        </h1>
        <label class="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
          </svg>
          <input
            #search
            type="search"
            placeholder="Rechercher un produit ou scanner un code"
            aria-label="Rechercher un produit ou scanner un code"
            autocomplete="off"
            [value]="menuService.query()"
            (input)="menuService.setQuery(search.value)"
            (keydown.enter)="onEnter()"
            (keydown.escape)="clear()"
          />
          @if (menuService.query()) {
            <button class="clear" (click)="clear()" aria-label="Effacer la recherche">✕</button>
          }
        </label>
      </header>

      <div class="grid">
        @if (menuService.loading() && menuService.filteredProducts().length === 0) {
          @for (i of skeletons; track i) {
            <div class="skeleton"></div>
          }
        } @else {
          @for (product of menuService.filteredProducts(); track product.id) {
            <app-product-card [product]="product" />
          } @empty {
            <div class="empty">
              @if (menuService.query()) {
                <p>Aucun produit ne correspond à « {{ menuService.query() }} »</p>
                <button (click)="clear()">Effacer la recherche</button>
              } @else {
                <p>Aucun produit dans cette catégorie</p>
              }
            </div>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    :host {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .catalog {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 2px 2px 14px;
    }

    .title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.03em;
      white-space: nowrap;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .hint {
      font-size: 14px;
      font-weight: 700;
      color: var(--ink-faint);
      letter-spacing: 0;
    }

    .search {
      margin-left: auto;
      width: min(420px, 100%);
      height: 44px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 12px 0 14px;
      background: var(--surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      color: var(--ink-faint);
      transition: box-shadow 0.2s;
    }

    .search:focus-within {
      box-shadow: 0 0 0 2px var(--accent), var(--shadow-sm);
      color: var(--ink-soft);
    }

    .search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      font-weight: 500;
      color: var(--ink);
    }

    .search input::-webkit-search-cancel-button { display: none; }

    .search input::placeholder { color: var(--ink-faint); }

    .search .clear {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      font-size: 12px;
      color: var(--ink-soft);
      background: var(--surface-muted);
    }

    .grid {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(156px, 1fr));
      grid-auto-rows: min-content;
      gap: 12px;
      padding: 2px 2px 24px;
      align-content: start;
    }

    .grid::-webkit-scrollbar { width: 6px; }
    .grid::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }

    .skeleton {
      height: 212px;
      border-radius: var(--radius-lg);
      background: linear-gradient(90deg, var(--surface-sunken), var(--surface-muted), var(--surface-sunken));
      background-size: 200% 100%;
      animation: shimmer 1.2s linear infinite;
    }

    @keyframes shimmer {
      to { background-position: -200% 0; }
    }

    .empty {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 64px 16px;
      color: var(--ink-soft);
      font-weight: 600;
    }

    .empty button {
      padding: 10px 16px;
      border-radius: var(--radius-md);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      font-weight: 600;
    }
  `]
})
export class ProductGridComponent {
  menuService = inject(MenuService);
  private cartService = inject(CartService);

  @ViewChild('search') searchInput?: ElementRef<HTMLInputElement>;

  skeletons = Array.from({ length: 10 }, (_, i) => i);

  /** Enter: exact code (barcode scanner) or single result is added straight to the ticket. */
  onEnter(): void {
    const query = this.menuService.query();
    const byCode = this.menuService.productByCode(query);
    const results = this.menuService.filteredProducts();
    const product = byCode ?? (results.length === 1 ? results[0] : undefined);
    if (product) {
      this.cartService.addToCart(product);
      this.clear();
    }
  }

  clear(): void {
    this.menuService.setQuery('');
    if (this.searchInput) this.searchInput.nativeElement.value = '';
  }

  /**
   * A barcode scanner types like a keyboard: when nothing else has the focus, send the keys to the
   * search field so that scanning works without clicking it first.
   */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (typing || event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
    if (document.querySelector('[role="dialog"]')) return;
    const input = this.searchInput?.nativeElement;
    if (!input) return;
    event.preventDefault();
    input.focus();
    input.value += event.key;
    this.menuService.setQuery(input.value);
  }
}
