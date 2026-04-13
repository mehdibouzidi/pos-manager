import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CaisseSessionService } from '../../../../backend/service/business/caisse-session.service';

@Component({
  selector: 'app-close-caisse-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    @if (caisseSessionService.closeModalVisible()) {
      <div class="caisse-overlay" (click)="cancel()">
        <div class="caisse-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-icon modal-icon--close">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h2>Clôture de caisse</h2>
            <button class="close-btn" (click)="cancel()">✕</button>
          </div>

          <div class="modal-body">
            @if (session(); as s) {
              <div class="session-stats">
                <div class="stat-row">
                  <span class="stat-label">Fond d'ouverture</span>
                  <span class="stat-value">{{ s.openingBalance | number:'1.2-2' }} Da</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Ventes de la session</span>
                  <span class="stat-value highlight">{{ (s.totalSalesAmount ?? 0) | number:'1.2-2' }} Da</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Nombre de ventes</span>
                  <span class="stat-value">{{ s.totalSalesCount ?? 0 }}</span>
                </div>
                @if (s.firstOrderNumber && s.lastOrderNumber) {
                  <div class="stat-row">
                    <span class="stat-label">Commandes</span>
                    <span class="stat-value">#{{ s.firstOrderNumber }} → #{{ s.lastOrderNumber }}</span>
                  </div>
                }
                <div class="stat-row stat-row--total">
                  <span class="stat-label">Solde attendu</span>
                  <span class="stat-value">{{ ((s.openingBalance ?? 0) + (s.totalSalesAmount ?? 0)) | number:'1.2-2' }} Da</span>
                </div>
              </div>
            }

            <div class="divider"></div>

            <div class="field-group">
              <label>Montant compté (Da)</label>
              <input
                type="number"
                [(ngModel)]="closingBalance"
                placeholder="0.00"
                min="0"
                step="0.01"
                class="balance-input"
                (ngModelChange)="computeVariance()"
              />
            </div>

            @if (closingBalance !== null) {
              <div class="variance-row" [class.variance-positive]="variance >= 0" [class.variance-negative]="variance < 0">
                <span>Écart</span>
                <span>{{ variance | number:'1.2-2' }} Da</span>
              </div>
            }

            <div class="field-group" style="margin-top: 16px;">
              <label>Notes (optionnel)</label>
              <textarea
                [(ngModel)]="notes"
                placeholder="Observations, remarques..."
                rows="2"
                class="notes-input"
              ></textarea>
            </div>

            @if (error()) {
              <div class="msg error">{{ error() }}</div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="cancel()">Annuler</button>
            <button class="btn-confirm" (click)="confirm()" [disabled]="saving() || closingBalance === null">
              @if (saving()) {
                <span class="spinner"></span>
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Clôturer &amp; Imprimer
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
      background: rgba(0, 0, 0, 0.6);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .caisse-modal {
      background: white;
      border-radius: 16px;
      padding: 28px;
      width: 460px;
      max-width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      position: relative;
    }

    .modal-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--primary-orange-light);
      color: var(--primary-orange);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon--close {
      background: #fee2e2;
      color: #dc2626;
    }

    .modal-header h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-dark);
      flex: 1;
    }

    .close-btn {
      position: absolute;
      right: 0;
      top: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-light);
      color: var(--text-muted);
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .session-stats {
      background: var(--bg-light);
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 0.9rem;
    }

    .stat-label {
      color: var(--text-muted);
    }

    .stat-value {
      font-weight: 600;
      color: var(--text-dark);
    }

    .stat-value.highlight {
      color: var(--primary-orange);
      font-size: 1rem;
    }

    .stat-row--total {
      border-top: 1px solid var(--border-color);
      margin-top: 6px;
      padding-top: 10px;
    }

    .stat-row--total .stat-label,
    .stat-row--total .stat-value {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-dark);
    }

    .divider {
      height: 1px;
      background: var(--border-color);
      margin: 16px 0;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-dark);
    }

    .balance-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid var(--border-color);
      border-radius: 10px;
      font-size: 1.3rem;
      font-weight: 600;
      text-align: center;
      color: var(--text-dark);
      transition: border-color 0.2s;
      outline: none;
    }

    .balance-input:focus {
      border-color: var(--primary-orange);
    }

    .notes-input {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid var(--border-color);
      border-radius: 8px;
      font-size: 0.875rem;
      resize: vertical;
      outline: none;
      transition: border-color 0.2s;
    }

    .notes-input:focus {
      border-color: var(--primary-orange);
    }

    .variance-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 700;
      margin-top: 10px;
    }

    .variance-positive {
      background: #dcfce7;
      color: #16a34a;
    }

    .variance-negative {
      background: #fee2e2;
      color: #dc2626;
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
      gap: 12px;
      margin-top: 24px;
    }

    .btn-cancel {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      background: var(--bg-light);
      color: var(--text-dark);
      font-size: 0.95rem;
      font-weight: 600;
    }

    .btn-cancel:hover {
      background: var(--border-color);
    }

    .btn-confirm {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: 10px;
      background: #dc2626;
      color: white;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-confirm:hover:not(:disabled) {
      background: #b91c1c;
      transform: translateY(-1px);
    }

    .btn-confirm:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
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
export class CloseCaisseModalComponent {
  caisseSessionService = inject(CaisseSessionService);

  closingBalance: number | null = null;
  notes: string = '';
  variance: number = 0;
  saving = signal(false);
  error = signal<string | null>(null);

  private logoBase64 = '';

  session = this.caisseSessionService.currentSession;

  constructor() {
    fetch('assets/logo/logoElAfia.png')
      .then(r => r.blob())
      .then(blob => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }))
      .then(b64 => this.logoBase64 = b64)
      .catch(() => {});
  }

  computeVariance(): void {
    const s = this.session();
    if (s && this.closingBalance !== null) {
      const expected = (s.openingBalance ?? 0) + (s.totalSalesAmount ?? 0);
      this.variance = this.closingBalance - expected;
    }
  }

  cancel(): void {
    this.caisseSessionService.hideCloseModal();
    this.closingBalance = null;
    this.notes = '';
    this.variance = 0;
    this.error.set(null);
  }

  confirm(): void {
    if (this.closingBalance === null || this.closingBalance < 0) {
      this.error.set('Saisissez un montant compté valide.');
      return;
    }
    this.error.set(null);
    this.saving.set(true);

    this.caisseSessionService.close({
      closingBalance: this.closingBalance,
      notes: this.notes || undefined
    }).subscribe({
      next: (closedSession) => {
        this.caisseSessionService.setCurrentSession(null);
        this.caisseSessionService.hideCloseModal();
        this.saving.set(false);
        this.printZTicket(closedSession);
        this.closingBalance = null;
        this.notes = '';
        this.variance = 0;
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Impossible de clôturer la caisse. Réessayez.';
        this.error.set(msg);
        this.saving.set(false);
      }
    });
  }

  private printZTicket(session: any): void {
    const now = new Date();
    const openedAt = session.openedAt ? new Date(session.openedAt) : now;
    const closedAt = session.closedAt ? new Date(session.closedAt) : now;
    const expected = ((session.openingBalance ?? 0) + (session.totalSalesAmount ?? 0)).toFixed(2);
    const varianceVal = (session.variance ?? 0).toFixed(2);
    const varianceSign = (session.variance ?? 0) >= 0 ? '+' : '';

    const orderRange = (session.firstOrderNumber && session.lastOrderNumber)
      ? `#${session.firstOrderNumber} → #${session.lastOrderNumber}`
      : '-';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Z-Ticket</title>
  <style>
    @page { size: 72mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      width: 72mm;
      height: fit-content;
      margin: 0;
      padding: 3mm 4mm;
      background: white;
      font-size: 10px;
      line-height: 1.5;
    }
    .header { text-align: center; padding-bottom: 6px; border-bottom: 1px dashed #000; margin-bottom: 8px; }
    .store-name { font-size: 13px; font-weight: bold; }
    .title { font-size: 14px; font-weight: bold; text-align: center; margin: 8px 0; border: 1px solid #000; padding: 4px; }
    .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 10px; }
    .row.bold { font-weight: bold; }
    .row.total { border-top: 1px dashed #000; margin-top: 4px; padding-top: 6px; font-size: 11px; font-weight: bold; }
    .row.variance-pos { color: #16a34a; font-weight: bold; }
    .row.variance-neg { color: #dc2626; font-weight: bold; }
    .section { margin: 8px 0; padding-top: 6px; border-top: 1px dashed #000; }
    .footer { text-align: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #000; font-size: 9px; }
  </style>
</head>
<body>
  <div class="header">
    ${this.logoBase64 ? `<img src="${this.logoBase64}" style="width:50px;height:50px;object-fit:contain;margin-bottom:4px;" alt="">` : ''}
    <div class="store-name">SARL El Afia</div>
  </div>

  <div class="title">★ RAPPORT DE CLÔTURE ★</div>

  <div class="row"><span>Date</span><span>${now.toLocaleDateString('fr-FR')}</span></div>
  <div class="row"><span>Ouverture</span><span>${openedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>
  <div class="row"><span>Clôture</span><span>${closedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>
  <div class="row"><span>Commandes</span><span>${orderRange}</span></div>

  <div class="section">
    <div class="row"><span>Fond d'ouverture</span><span>${(session.openingBalance ?? 0).toFixed(2)} Da</span></div>
    <div class="row bold"><span>Total ventes</span><span>${(session.totalSalesAmount ?? 0).toFixed(2)} Da</span></div>
    <div class="row"><span>Nb ventes</span><span>${session.totalSalesCount ?? 0}</span></div>
    <div class="row total"><span>Solde attendu</span><span>${expected} Da</span></div>
  </div>

  <div class="section">
    <div class="row bold"><span>Montant compté</span><span>${(session.closingBalance ?? 0).toFixed(2)} Da</span></div>
    <div class="row ${(session.variance ?? 0) >= 0 ? 'variance-pos' : 'variance-neg'}">
      <span>Écart</span><span>${varianceSign}${varianceVal} Da</span>
    </div>
  </div>

  ${session.notes ? `<div class="section"><div class="row"><span>Notes :</span></div><div style="font-size:9px;margin-top:3px;">${session.notes}</div></div>` : ''}

  <div class="footer">
    <div>Caissier : ${session.createdByFullName ?? '-'}</div>
    <div style="margin-top:4px;">Fin de journée</div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=250,height=600');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }
}
