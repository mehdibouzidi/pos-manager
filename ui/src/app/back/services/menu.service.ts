import { Injectable, signal } from '@angular/core';
import { Category, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _selectedCategoryId = signal<string>('fast-food');
  private _selectedSubcategoryId = signal<string>('pizzas');

  readonly selectedCategoryId = this._selectedCategoryId.asReadonly();
  readonly selectedSubcategoryId = this._selectedSubcategoryId.asReadonly();

  readonly categories: Category[] = [
    {
      id: 'deals',
      name: 'Offres FoodGo',
      icon: '🏷️',
      subcategories: [
        { id: 'daily', name: 'Spéciaux du Jour' },
        { id: 'combo', name: 'Combos' }
      ]
    },
    {
      id: 'appetizers',
      name: 'Entrées',
      icon: '🥗',
      subcategories: [
        { id: 'starters', name: 'Amuse-bouches' },
        { id: 'soups', name: 'Soupes' }
      ]
    },
    {
      id: 'fast-food',
      name: 'Fast Food',
      icon: '🍔',
      subcategories: [
        { id: 'pizzas', name: 'Pizzas & Pains plats' },
        { id: 'burgers', name: 'Burgers & Sandwichs' },
        { id: 'salads', name: 'Salades & Bols' }
      ]
    },
    {
      id: 'desi-food',
      name: 'Cuisine Desi',
      icon: '🍛',
      subcategories: [
        { id: 'curries', name: 'Currys' },
        { id: 'biryani', name: 'Biryani' }
      ]
    },
    {
      id: 'sea-food',
      name: 'Fruits de Mer',
      icon: '🦐',
      subcategories: [
        { id: 'fish', name: 'Poisson' },
        { id: 'shrimp', name: 'Crevettes' }
      ]
    },
    {
      id: 'chicken',
      name: 'Poulet',
      icon: '🍗',
      subcategories: [
        { id: 'grilled', name: 'Grillé' },
        { id: 'fried', name: 'Frit' }
      ]
    },
    {
      id: 'desserts',
      name: 'Desserts',
      icon: '🍰',
      subcategories: [
        { id: 'cakes', name: 'Gâteaux' },
        { id: 'ice-cream', name: 'Glaces' }
      ]
    },
    {
      id: 'beverages',
      name: 'Boissons',
      icon: '🥤',
      subcategories: [
        { id: 'soft-drinks', name: 'Sodas' },
        { id: 'juices', name: 'Jus' }
      ]
    }
  ];

  readonly products: Product[] = [
    {
      id: 'p1',
      name: 'Classic Margherita',
      description: 'Une pizza classique avec sauce tomate fraîche, mozzarella fondante et feuilles de basilic.',
      price: 2.99,
      image: 'assets/images/pizza-margherita.png',
      categoryId: 'fast-food',
      subcategoryId: 'pizzas',
      stock: 14
    },
    {
      id: 'p2',
      name: 'Pepperoni Inferno',
      description: 'Généreusement garnie de pepperoni épicé sur une base de sauce tomate relevée.',
      price: 3.99,
      image: 'assets/images/pizza-pepperoni.png',
      categoryId: 'fast-food',
      subcategoryId: 'pizzas',
      stock: 8
    },
    {
      id: 'p3',
      name: 'Veggie Garden',
      description: 'Un mélange coloré de légumes frais : poivrons, champignons, courgettes et tomates cerises.',
      price: 2.00,
      image: 'assets/images/pizza-veggie.png',
      categoryId: 'fast-food',
      subcategoryId: 'pizzas',
      stock: 0
    },
    {
      id: 'p4',
      name: 'Spicy Hawaiian',
      description: 'L\'alliance surprenante du jambon fumé, de l\'ananas juteux et d\'une touche de piment.',
      price: 4.99,
      image: 'assets/images/pizza-hawaiian.png',
      categoryId: 'fast-food',
      subcategoryId: 'pizzas',
      stock: 5
    },
    {
      id: 'p5',
      name: 'Four Cheese Heaven',
      description: 'Un délice fromager avec mozzarella, gorgonzola, parmesan et chèvre fondus ensemble.',
      price: 5.99,
      image: 'assets/images/pizza-cheese.png',
      categoryId: 'fast-food',
      subcategoryId: 'pizzas',
      stock: 11
    },
    {
      id: 'p6',
      name: 'Mediterranean Olive',
      description: 'Inspirée du soleil méditerranéen : olives noires, feta, tomates séchées et herbes aromatiques.',
      price: 5.00,
      image: 'assets/images/pizza-olive.png',
      categoryId: 'fast-food',
      subcategoryId: 'pizzas',
      stock: 3
    }
  ];

  selectCategory(categoryId: string): void {
    this._selectedCategoryId.set(categoryId);
    const category = this.categories.find(c => c.id === categoryId);
    if (category && category.subcategories.length > 0) {
      this._selectedSubcategoryId.set(category.subcategories[0].id);
    }
  }

  selectSubcategory(subcategoryId: string): void {
    this._selectedSubcategoryId.set(subcategoryId);
  }

  getSelectedCategory(): Category | undefined {
    return this.categories.find(c => c.id === this._selectedCategoryId());
  }

  getFilteredProducts(): Product[] {
    return this.products.filter(
      p => p.categoryId === this._selectedCategoryId() && 
           p.subcategoryId === this._selectedSubcategoryId()
    );
  }
}
