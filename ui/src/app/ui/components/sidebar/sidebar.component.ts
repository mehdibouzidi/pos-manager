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
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    .rail {
      width: 112px;
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 4px 2px 12px;
      scrollbar-width: none;
    }

    .rail::-webkit-scrollbar { display: none; }

    .category {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 8px 14px;
      border-radius: var(--radius-lg);
      color: var(--ink-soft);
      text-align: center;
      transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    }

    .category:hover {
      background: var(--surface);
      color: var(--ink);
    }

    .category.active {
      background: var(--surface);
      color: var(--ink);
      box-shadow: var(--shadow-md), inset 3px 0 0 var(--accent);
    }

    .thumb {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      object-fit: cover;
    }



    .label {
      font-size: 13px;
      font-weight: 600;
      line-height: 1.25;
      text-wrap: balance;
    }

    .skeleton {
      height: 88px;
      border-radius: var(--radius-lg);
      background: linear-gradient(90deg, var(--surface-sunken), var(--surface-muted), var(--surface-sunken));
      background-size: 200% 100%;
      animation: shimmer 1.2s linear infinite;
    }

    @keyframes shimmer {
      to { background-position: -200% 0; }
    }
  `]
})
export class SidebarComponent {
  menuService = inject(MenuService);
}
