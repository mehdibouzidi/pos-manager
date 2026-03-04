import { Component } from '@angular/core';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  template: `
    <div class="promo-banner">
      <div class="promo-content">
        <h2>Offres Spéciales du Jour !</h2>
        <p>De tendres tranches de poulet assaisonné sur un lit de jeunes pousses, avec de juteux segments d&apos;orange et des noix de cajou croquantes.</p>
        <button class="order-btn">Commander !</button>
      </div>
      <div class="promo-images">
        <img src="assets/images/burger-promo.png" alt="Burger" class="promo-img burger">
        <img src="assets/images/salad-promo.png" alt="Salad" class="promo-img salad">
      </div>
    </div>
  `,
  styles: [`
    .promo-banner {
      background: linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%);
      border-radius: var(--radius-xl);
      padding: 24px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      min-height: 140px;
    }

    .promo-content {
      flex: 1;
      z-index: 2;
      max-width: 50%;
    }

    .promo-content h2 {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .promo-content p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 16px;
      max-width: 320px;
    }

    .order-btn {
      background: white;
      color: var(--primary-orange);
      padding: 10px 24px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 14px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .order-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .promo-images {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: 10px;
    }

    .promo-img {
      width: 120px;
      height: 120px;
      object-fit: contain;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }

    .promo-img.burger {
      transform: rotate(-10deg);
    }

    .promo-img.salad {
      transform: rotate(10deg);
    }
  `]
})
export class PromoBannerComponent {}
