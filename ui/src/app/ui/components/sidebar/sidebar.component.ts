import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MenuService } from '../../../back/services/menu.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-icon">🍕</span>
      </div>
      <nav class="categories">
        @for (category of menuService.categories; track category.id) {
          <button 
            class="category-item"
            [ngClass]="{ 'active': category.id === menuService.selectedCategoryId() }"
            (click)="menuService.selectCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </button>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 140px;
      background: white;
      border-radius: var(--radius-xl);
      padding: 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: var(--shadow-md);
      height: 100%;
      overflow-y: auto;
    }

    .logo {
      display: flex;
      justify-content: center;
      padding: 16px 0;
      margin-bottom: 8px;
    }

    .logo-icon {
      font-size: 32px;
    }

    .categories {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 14px 8px;
      background: transparent;
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
      text-align: center;
    }

    .category-item:hover {
      background: var(--bg-light);
    }

    .category-item.active {
      background: var(--primary-orange);
      color: white;
    }

    .category-icon {
      font-size: 24px;
    }

    .category-name {
      font-size: 11px;
      font-weight: 500;
      line-height: 1.2;
    }
  `]
})
export class SidebarComponent {
  menuService = inject(MenuService);
}
