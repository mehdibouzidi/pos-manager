import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalStorageService } from '../../../../backend/service/admin/local-storage.service';
import { UserService } from '../../../../backend/service/admin/user.service';
import { AuthService } from '../../../../backend/service/admin/auth.service';
import { ChangePasswordPayload } from '../../../../backend/payloads/admin/changepasswordpayload';
import { UtilStatic } from '../../../../backend/service/util/UtilStatic';
import { CaisseSessionService } from '../../../../backend/service/business/caisse-session.service';
import { ConnectivityService } from '../../../../backend/service/offline/connectivity.service';
import { SyncService } from '../../../../backend/service/offline/sync.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <span class="app-name">El Afia <span class="app-sub">Caisse</span></span>
        @if (caisseSessionService.currentSession(); as s) {
          <span class="session-info num">
            <span class="session-dot"></span>
            Ouverte{{ s.openedAt ? ' à ' + (s.openedAt | date:'HH:mm') : '' }}
            · {{ s.totalSalesCount ?? 0 }} vente{{ (s.totalSalesCount ?? 0) > 1 ? 's' : '' }}
            · {{ (s.totalSalesAmount ?? 0) | number:'1.2-2' }} DA
          </span>
        } @else {
          <span class="session-info session-info--closed">Caisse fermée</span>
        }
      </div>

      <div class="topbar-right" #menuAnchor>

        @if (syncService.lastSyncError()) {
          <span class="sync-error-badge" [title]="syncService.lastSyncError()!">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Sync échouée
          </span>
        }

        @if (syncService.failedCount() > 0 && connectivityService.isOnline() && !syncService.syncing()) {
          <button class="sync-btn" (click)="retryFailed()"
                  title="Opérations refusées par le serveur (conservées sur ce poste). Cliquez pour les renvoyer.">
            Renvoyer les refusées ({{ syncService.failedCount() }})
          </button>
        }

        @if (syncService.pendingCount() > 0 && connectivityService.isOnline() && !syncService.syncing()) {
          <button class="sync-btn" (click)="syncNow()" title="Synchroniser maintenant">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Synchroniser ({{ syncService.pendingCount() }})
          </button>
        }

        @if (connectivityService.isOnline() && !syncService.syncing()) {
          <span class="online-badge">
            <span class="online-dot"></span>
            En ligne
          </span>
        }

        @if (!connectivityService.isOnline()) {
          <span class="offline-badge">
            <span class="offline-dot"></span>
            Hors ligne
            @if (syncService.pendingCount() > 0) {
              <span class="pending-count">{{ syncService.pendingCount() }}</span>
            }
          </span>
        }

        @if (syncService.syncing()) {
          <span class="syncing-badge">
            <span class="syncing-spinner"></span>
            Synchronisation…
          </span>
        }

        @if (caisseSessionService.currentSession()) {
          <button class="close-caisse-btn" (click)="closeSession()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            Clôturer la caisse
          </button>
          <div class="topbar-divider"></div>
        }

        <div class="user-info">
          @if (posName) {
            <span class="store-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              {{ posName }}
            </span>
          }
          <span class="avatar" aria-hidden="true">{{ initials }}</span>
          <span class="username">{{ fullName }}</span>
        </div>

        <button class="menu-btn" (click)="toggleMenu()" [class.active]="menuOpen()" aria-label="Menu utilisateur">
          <span class="menu-dot"></span>
          <span class="menu-dot"></span>
          <span class="menu-dot"></span>
        </button>

        @if (menuOpen()) {
          <div class="dropdown">
            <button class="dropdown-item" (click)="openPasswordModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Modifier le mot de passe
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item dropdown-item--danger" (click)="logout()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        }
      </div>
    </header>

    <!-- Change Password Modal -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Modifier le mot de passe</h3>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="field-group">
              <label>Mot de passe actuel</label>
              <div class="pwd-wrapper">
                <input [type]="showOld ? 'text' : 'password'" [(ngModel)]="payload.oldPassword" placeholder="Mot de passe actuel" />
                <button type="button" class="eye-btn" (click)="showOld = !showOld">{{ showOld ? '🙈' : '👁️' }}</button>
              </div>
            </div>

            <div class="field-group">
              <label>Nouveau mot de passe</label>
              <div class="pwd-wrapper">
                <input [type]="showNew ? 'text' : 'password'" [(ngModel)]="payload.newPassword" placeholder="Nouveau mot de passe" />
                <button type="button" class="eye-btn" (click)="showNew = !showNew">{{ showNew ? '🙈' : '👁️' }}</button>
              </div>
            </div>

            <div class="field-group">
              <label>Confirmer le nouveau mot de passe</label>
              <div class="pwd-wrapper">
                <input [type]="showConfirm ? 'text' : 'password'" [(ngModel)]="payload.newPasswordConfirmed" placeholder="Confirmer le mot de passe" />
                <button type="button" class="eye-btn" (click)="showConfirm = !showConfirm">{{ showConfirm ? '🙈' : '👁️' }}</button>
              </div>
            </div>

            @if (modalError()) {
              <div class="msg error">{{ modalError() }}</div>
            }
            @if (modalSuccess()) {
              <div class="msg success">{{ modalSuccess() }}</div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Annuler</button>
            <button class="btn-confirm" (click)="submitPassword()" [disabled]="saving()">
              @if (saving()) { <span class="spinner"></span> } @else { Confirmer }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Topbar ─────────────────────────────────────── */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 0 16px 0 20px;
      height: 60px;
      background: var(--surface);
      border-bottom: 1px solid var(--line);
      position: relative;
      z-index: var(--z-dropdown);
      flex-shrink: 0;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }

    .app-name {
      font-weight: 800;
      font-size: 17px;
      letter-spacing: -0.02em;
      color: var(--ink);
      white-space: nowrap;
    }

    .app-sub {
      font-weight: 600;
      color: var(--accent);
    }

    .session-info {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      background: var(--surface-muted);
      color: var(--ink-soft);
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .session-info--closed { color: var(--ink-faint); }

    /* Narrow screens (10" tablets): keep the session summary and actions, drop secondary labels */
    @media (max-width: 1180px) {
      .username, .store-badge { display: none; }
    }

    .session-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--ok);
      flex-shrink: 0;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: var(--accent-soft);
      color: var(--accent-ink);
      font-size: 12px;
      font-weight: 800;
    }

    .username {
      font-weight: 600;
      font-size: 14px;
      color: var(--ink);
      white-space: nowrap;
    }

    .store-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: var(--radius-sm);
      background: var(--surface-muted);
      color: var(--ink-soft);
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    /* ── Close caisse button: secondary, the ticket stays the main action ── */
    .close-caisse-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 14px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: var(--surface);
      color: var(--ink);
      box-shadow: inset 0 0 0 1.5px var(--line);
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      transition: box-shadow 0.15s, color 0.15s, background-color 0.15s;
    }

    .close-caisse-btn:hover {
      color: var(--danger);
      background: var(--danger-soft);
      box-shadow: inset 0 0 0 1.5px transparent;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.35; }
    }

    .topbar-divider {
      width: 1px;
      height: 24px;
      background: var(--line);
      flex-shrink: 0;
    }

    /* ── Menu button (3 dots) ────────────────────────── */
    .menu-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      transition: background-color 0.2s;
    }

    .menu-btn:hover,
    .menu-btn.active {
      background: var(--surface-muted);
    }

    .menu-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--ink-soft);
    }

    /* ── Dropdown ────────────────────────────────────── */
    .dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: var(--surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      min-width: 230px;
      padding: 6px;
      animation: fadeIn 0.15s ease;
      z-index: var(--z-dropdown);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
      color: var(--ink);
      transition: background-color 0.15s;
    }

    .dropdown-item:hover {
      background: var(--surface-muted);
    }

    .dropdown-divider {
      height: 1px;
      background: var(--line);
      margin: 4px 6px;
    }

    .dropdown-item--danger { color: var(--danger); }

    .dropdown-item--danger:hover { background: var(--danger-soft); }

    /* ── Modal ───────────────────────────────────────── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(31, 27, 23, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
    }

    .modal {
      background: white;
      border-radius: var(--radius-lg);
      width: 420px;
      max-width: 95vw;
      box-shadow: var(--shadow-lg);
      animation: fadeIn 0.2s ease;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-dark);
    }

    .close-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: transparent;
      color: var(--text-gray);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }

    .close-btn:hover { background: var(--border-color); }

    .modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-group label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-gray);
    }

    .pwd-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .pwd-wrapper input {
      width: 100%;
      padding: 10px 40px 10px 14px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }

    .pwd-wrapper input:focus { border-color: var(--primary-orange); }

    .eye-btn {
      position: absolute;
      right: 10px;
      background: transparent;
      font-size: 1rem;
      padding: 0;
      line-height: 1;
    }

    .msg {
      font-size: 0.85rem;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
    }

    .msg.error   { background: var(--danger-soft); color: var(--danger); }
    .msg.success { background: var(--ok-soft); color: var(--ok); }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px 20px;
      border-top: 1px solid var(--border-color);
    }

    .btn-cancel {
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      background: var(--border-color);
      color: var(--text-dark);
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.15s;
    }

    .btn-cancel:hover { background: #d1d5db; }

    .btn-confirm {
      padding: 10px 22px;
      border-radius: var(--radius-sm);
      background: var(--primary-orange);
      color: white;
      font-size: 0.9rem;
      font-weight: 600;
      min-width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }

    .btn-confirm:hover:not(:disabled) { background: var(--primary-orange-dark); }
    .btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Connectivity / sync status ───────────────────── */
    .online-badge, .offline-badge, .syncing-badge, .sync-error-badge, .sync-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 30px;
      padding: 0 10px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .online-badge { color: var(--ok); }

    .online-dot, .offline-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .online-dot { background: var(--ok); }

    .offline-badge {
      background: var(--warn-soft);
      color: var(--warn);
    }

    .offline-dot { background: var(--warn); }

    .pending-count {
      display: inline-grid;
      place-items: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: var(--warn);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
    }

    .syncing-badge {
      background: var(--surface-muted);
      color: var(--ink-soft);
    }

    .syncing-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid var(--line);
      border-top-color: var(--ink-soft);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    .sync-error-badge {
      background: var(--danger-soft);
      color: var(--danger);
      cursor: help;
    }

    .sync-btn {
      background: var(--surface-muted);
      color: var(--ink);
      transition: background-color 0.15s;
    }

    .sync-btn:hover { background: var(--surface-sunken); }
  `]
})
export class TopbarComponent {
  private ls = inject(LocalStorageService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private elRef = inject(ElementRef);
  caisseSessionService = inject(CaisseSessionService);
  connectivityService = inject(ConnectivityService);
  syncService = inject(SyncService);

  menuOpen = signal(false);
  showModal = signal(false);
  saving = signal(false);
  modalError = signal('');
  modalSuccess = signal('');

  payload = new ChangePasswordPayload();
  showOld = false;
  showNew = false;
  showConfirm = false;

  get posName(): string | null {
    return this.ls.getItem(UtilStatic.POS_NAME)
        || this.ls.getItem(UtilStatic.POS_CODE)
        || null;
  }

  get fullName(): string {
    const first = this.ls.getItem(UtilStatic.FIRSTNAME) ?? '';
    const last  = this.ls.getItem(UtilStatic.LASTNAME)  ?? '';
    return `${first} ${last}`.trim() || this.ls.getItem(UtilStatic.USERNAME) || 'Utilisateur';
  }

  get initials(): string {
    const first = this.ls.getItem(UtilStatic.FIRSTNAME) ?? '';
    const last  = this.ls.getItem(UtilStatic.LASTNAME)  ?? '';
    if (first || last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    const username = this.ls.getItem(UtilStatic.USERNAME) ?? '?';
    return username.charAt(0).toUpperCase();
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  openPasswordModal() {
    this.menuOpen.set(false);
    this.payload = new ChangePasswordPayload();
    this.modalError.set('');
    this.modalSuccess.set('');
    this.showOld = false;
    this.showNew = false;
    this.showConfirm = false;
    this.showModal.set(true);
  }

  closeModal() {
    if (this.saving()) return;
    this.showModal.set(false);
  }

  submitPassword() {
    if (!this.payload.oldPassword || !this.payload.newPassword || !this.payload.newPasswordConfirmed) {
      this.modalError.set('Veuillez renseigner tous les champs.');
      return;
    }
    if (this.payload.newPassword !== this.payload.newPasswordConfirmed) {
      this.modalError.set('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    this.saving.set(true);
    this.modalError.set('');
    this.modalSuccess.set('');

    this.userService.updatePassword(this.payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.modalSuccess.set('Mot de passe modifié avec succès.');
        setTimeout(() => this.showModal.set(false), 1500);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.modalError.set(err?.error ?? 'Erreur lors de la modification du mot de passe.');
      }
    });
  }

  logout() {
    this.menuOpen.set(false);
    this.authService.logout();
  }

  syncNow(): void {
    this.syncService.flush();
  }

  retryFailed(): void {
    this.syncService.retryFailed();
  }

  closeSession(): void {
    this.menuOpen.set(false);
    // Refresh stats before opening so the modal always shows live totals
    this.caisseSessionService.getCurrent().subscribe({
      next: (session) => {
        this.caisseSessionService.setCurrentSession(session);
        this.caisseSessionService.showCloseModal();
      },
      error: () => this.caisseSessionService.showCloseModal()
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpen() && !this.elRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }
}
