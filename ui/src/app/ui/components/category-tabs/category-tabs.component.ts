import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MenuService } from '../../../back/services/menu.service';

@Component({
  selector: 'app-category-tabs',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="tabs-container">
      @if (menuService.getSelectedCategory(); as category) {
        @for (sub of category.subcategories; track sub.id) {
          <button 
            class="tab"
            [ngClass]="{ 'active': sub.id === menuService.selectedSubcategoryId() }"
            (click)="menuService.selectSubcategory(sub.id)"
          >
            {{ sub.name }}
          </button>
        }
      }
    </div>
  `,
  styles: [`
    .tabs-container {
      display: flex;
      gap: 8px;
      padding: 8px 0;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tabs-container::-webkit-scrollbar {
      display: none;
    }

    .tab {
      padding: 10px 20px;
      background: white;
      border-radius: var(--radius-lg);
      font-size: 13px;
      font-weight: 500;
      color: var(--text-gray);
      white-space: nowrap;
      transition: all 0.2s ease;
      border: 1px solid var(--border-color);
    }

    .tab:hover {
      background: var(--bg-light);
      color: var(--primary-orange);
    }

    .tab.active {
      background: var(--primary-orange);
      color: white;
      border-color: var(--primary-orange);
    }
  `]
})
export class CategoryTabsComponent {
  menuService = inject(MenuService);
}
