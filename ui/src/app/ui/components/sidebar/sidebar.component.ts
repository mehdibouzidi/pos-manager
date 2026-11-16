import { Component, inject } from '@angular/core';
import { MenuService } from '../../../back/services/menu.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: `
    <nav class="rail" aria-label="Catégories">
      @if (menuService.loading() && menuService.categories().length === 0) {
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <div class="skeleton"></div>
        }
      } @else {
        @for (category of menuService.categories(); track category.id) {
          <button
            class="category"
            [class.active]="!menuService.query() && category.id === menuService.selectedCategoryId()"
            [attr.aria-current]="category.id === menuService.selectedCategoryId() ? 'true' : null"
            (click)="menuService.selectCategory(category.id)"
          >
            <img class="thumb"
                 [src]="category.photo ? 'data:image/jpeg;base64,' + category.photo : 'assets/img/placeholder-category.svg'"
                 [alt]="''">
            <span class="label">{{ category.name }}</span>
          </button>
        }
      }
    </nav>
  `,
  styles: [`
    /* Touchscreen first: big tiles, clear pressed and active states, hover only as a bonus. */
    :host {
      display: block;
      height: 100%;
      min-height: 0;
      --m-out: 200ms;
      --m-press: 90ms;
      --m-ease: cubic-bezier(.2, .8, .2, 1);
    }

    .rail {
      width: 136px;
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 2px 2px 16px;
      scrollbar-width: none;
      overscroll-behavior: contain;
    }

    .rail::-webkit-scrollbar { display: none; }

    .category {
      position: relative;
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      min-height: 124px;
      padding: 0;
      overflow: hidden;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      color: var(--ink-soft);
      text-align: center;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
      transition:
        transform 180ms var(--m-ease),
        background-color var(--m-out) var(--m-ease),
        border-color var(--m-out) var(--m-ease),
        color var(--m-out) var(--m-ease),
        box-shadow var(--m-out) var(--m-ease);
    }

    .category:active {
      transform: scale(0.96);
      border-color: var(--accent);
      transition-duration: var(--m-press);
    }

    @media (hover: hover) and (pointer: fine) {
      .category:hover:not(.active) {
        border-color: #d3cdc6;
        color: var(--ink);
      }
    }

    .category:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .category.active {
      background: var(--accent-soft);
      border-color: var(--accent);
      color: var(--accent-ink);
      box-shadow: 0 0 0 1px var(--accent), 0 6px 16px -10px rgba(196, 82, 15, 0.5);
    }

    /* The photo fills the top of the tile, edge to edge: no box inside the box */
    .thumb {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      background: #fdf1e8;
    }

    .label {
      display: block;
      padding: 10px 8px 12px;
      font-size: 14px;
      font-weight: 650;
      line-height: 1.25;
      text-wrap: balance;
      overflow-wrap: anywhere;
    }

    .category.active .label { font-weight: 750; }

    .skeleton {
      flex: none;
      height: 124px;
      border-radius: var(--radius-lg);
      background: linear-gradient(90deg, var(--surface-sunken), var(--surface-muted), var(--surface-sunken));
      background-size: 200% 100%;
      animation: shimmer 1.2s linear infinite;
    }

    @keyframes shimmer {
      to { background-position: -200% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .category { transition: none; }
      .category:active { transform: none; }
      .skeleton { animation: none; }
    }
  `]
})
export class SidebarComponent {
  menuService = inject(MenuService);
}
