import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CaisseSessionService } from '../../../../backend/service/business/caisse-session.service';

@Component({
  selector: 'app-open-caisse-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (caisseSessionService.openModalVisible()) {
      <div class="caisse-overlay">
        <div class="caisse-modal">
          <div class="modal-header">
            <div class="modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h2>Ouverture de caisse</h2>
            <p class="modal-subtitle">Saisissez le fond de caisse pour commencer</p>
          </div>

          <div class="modal-body">
            <div class="field-group">
              <label>Fond d'ouverture (Da)</label>
              <input
                type="number"
                [(ngModel)]="openingBalance"
                placeholder="0.00"
                min="0"
                step="0.01"
                class="balance-input"
              />
            </div>

            @if (error()) {
              <div class="msg error">{{ error() }}</div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn-confirm" (click)="confirm()" [disabled]="saving()">
              @if (saving()) {
                <span class="spinner"></span>
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Ouvrir la caisse
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .caisse-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .caisse-modal {
      background: white;
      border-radius: 16px;
      padding: 36px;
      width: 400px;
      max-width: 90vw;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
    }

    .modal-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .modal-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--primary-orange-light);
      color: var(--primary-orange);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .modal-header h2 {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 6px;
    }

    .modal-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .modal-body {
      margin-bottom: 24px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-dark);
    }

    .balance-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 1.5rem;
      font-weight: 600;
      text-align: center;
      color: var(--text-dark);
      transition: border-color 0.2s;
      outline: none;
    }

    .balance-input:focus {
      border-color: var(--primary-orange);
    }

    .msg.error {
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      background: #fee2e2;
      color: #dc2626;
    }

    .modal-footer {
      display: flex;
      justify-content: center;
    }

    .btn-confirm {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 14px 24px;
      justify-content: center;
      background: var(--primary-orange);
      color: white;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-confirm:hover:not(:disabled) {
      background: var(--primary-orange-dark);
      transform: translateY(-1px);
    }

    .btn-confirm:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class OpenCaisseModalComponent {
  caisseSessionService = inject(CaisseSessionService);

  openingBalance: number = 0;
  saving = signal(false);
  error = signal<string | null>(null);

  confirm(): void {
    if (this.openingBalance < 0) {
      this.error.set('Le fond d\'ouverture ne peut pas être négatif.');
      return;
    }
    this.error.set(null);
    this.saving.set(true);

    this.caisseSessionService.open({ openingBalance: this.openingBalance }).subscribe({
      next: (session) => {
        this.caisseSessionService.setCurrentSession(session);
        this.caisseSessionService.hideOpenModal();
        this.saving.set(false);
        this.openingBalance = 0;
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Impossible d\'ouvrir la caisse. Réessayez.';
        this.error.set(msg);
        this.saving.set(false);
      }
    });
  }
}
