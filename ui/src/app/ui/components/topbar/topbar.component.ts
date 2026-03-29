import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalStorageService } from '../../../../backend/service/admin/local-storage.service';
import { UserService } from '../../../../backend/service/admin/user.service';
import { AuthService } from '../../../../backend/service/admin/auth.service';
import { ChangePasswordPayload } from '../../../../backend/payloads/admin/changepasswordpayload';
import { UtilStatic } from '../../../../backend/service/util/UtilStatic';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <span class="app-name">POS Manager</span>
      </div>

      <div class="topbar-right" #menuAnchor>
        <div class="user-info">
          @if (posName) {
            <span class="store-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              {{ posName }}
            </span>
            <span class="separator"></span>
          }
          <span class="username">{{ fullName }}</span>
        </div>

        <button class="menu-btn" (click)="toggleMenu()" [class.active]="menuOpen()">
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
        <div class="modal" (click)="$event.stopPropagation()">
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
      padding: 0 24px;
      height: 56px;
      background: white;
      box-shadow: var(--shadow-sm);
      border-bottom: 1px solid var(--border-color);
      position: relative;
      z-index: 100;
      flex-shrink: 0;
    }

    .app-name {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--primary-orange);
      letter-spacing: 0.5px;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-orange);
      color: white;
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .username {
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--text-dark);
      white-space: nowrap;
    }

    .store-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      background: var(--primary-orange-light);
      color: var(--primary-orange-dark);
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .separator {
      width: 1px;
      height: 18px;
      background: var(--border-color);
    }

    /* ── Menu button (3 dots) ────────────────────────── */
    .menu-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: transparent;
      transition: background 0.2s;
      padding: 0;
    }

    .menu-btn:hover,
    .menu-btn.active {
      background: var(--primary-orange-light);
    }

    .menu-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--text-gray);
    }

    /* ── Dropdown ────────────────────────────────────── */
    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      min-width: 220px;
      overflow: hidden;
      animation: fadeIn 0.15s ease;
      z-index: 200;
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
      padding: 12px 16px;
      font-size: 0.9rem;
      color: var(--text-dark);
      background: transparent;
      transition: background 0.15s;
    }

    .dropdown-item:hover {
      background: var(--primary-orange-light);
      color: var(--primary-orange-dark);
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-color);
      margin: 4px 0;
    }

    .dropdown-item--danger {
      color: #dc2626;
    }

    .dropdown-item--danger:hover {
      background: #fee2e2;
      color: #b91c1c;
    }

    /* ── Modal ───────────────────────────────────────── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
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

    .msg.error   { background: #fee2e2; color: #dc2626; }
    .msg.success { background: #dcfce7; color: #16a34a; }

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
  `]
})
export class TopbarComponent {
  private ls = inject(LocalStorageService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private elRef = inject(ElementRef);

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
    return this.ls.getItem(UtilStatic.POS_NAME) || null;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpen() && !this.elRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }
}
