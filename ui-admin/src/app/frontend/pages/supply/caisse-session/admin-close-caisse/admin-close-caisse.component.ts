import { Component, Inject } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CaisseSessionPayload } from 'src/app/backend/payloads/business/caisse-session-payload';
import { CaisseSessionService } from 'src/app/backend/service/business/caisse-session.service';

export interface AdminCloseCaisseData {
  /** Sessions to close; ignored when `all` is true (the server closes every open session). */
  sessions: CaisseSessionPayload[];
  /** Close every open caisse; `openCount` is only used for the confirmation text. */
  all?: boolean;
  openCount?: number;
}

/** Confirms closing caisses left open by the tills (one, a selection, or all). Closes with the list of closed sessions. */
@Component({
  selector: 'vex-admin-close-caisse',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatProgressSpinnerModule],
  template: `
    <div mat-dialog-title class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <mat-icon svgIcon="mat:lock" class="text-primary"></mat-icon>
        <span>{{ title }}</span>
      </div>
      <button mat-icon-button type="button" (click)="close()" [disabled]="saving">
        <mat-icon svgIcon="mat:close"></mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="flex flex-col gap-4 pt-2">
        <p class="m-0">{{ message }}</p>

        <ul *ngIf="!data.all && data.sessions.length > 1" class="m-0 pl-5 text-sm max-h-40 overflow-auto">
          <li *ngFor="let s of data.sessions">
            Caisse #{{ s.id }} — {{ s.posName }} — {{ s.createdByFullName }} — ouverte le {{ shortDate(s.openedAt) }}
          </li>
        </ul>

        <div *ngIf="single as s" class="rounded-lg border p-3 text-sm flex flex-col gap-1">
          <div class="flex justify-between"><span class="text-secondary">Caisse</span><span>#{{ s.id }} — {{ s.posName }}</span></div>
          <div class="flex justify-between"><span class="text-secondary">Caissier</span><span>{{ s.createdByFullName }}</span></div>
          <div class="flex justify-between"><span class="text-secondary">Ouverte le</span><span>{{ shortDate(s.openedAt) }}</span></div>
          <div class="flex justify-between"><span class="text-secondary">Fond d'ouverture</span><span>{{ (s.openingBalance ?? 0) | number:'1.2-2' }} Da</span></div>
          <div class="flex justify-between"><span class="text-secondary">Ventes</span><span>{{ (s.totalSalesAmount ?? 0) | number:'1.2-2' }} Da</span></div>
          <div class="flex justify-between font-medium"><span>Solde attendu</span><span>{{ expected | number:'1.2-2' }} Da</span></div>
        </div>

        <mat-form-field *ngIf="single">
          <mat-label>Montant compté (Da)</mat-label>
          <input matInput type="number" min="0" step="0.01" [(ngModel)]="closingBalance" placeholder="Laisser vide si non compté" />
          <mat-hint *ngIf="closingBalance !== null && closingBalance !== undefined">
            Écart : {{ (closingBalance - expected) | number:'1.2-2' }} Da
          </mat-hint>
        </mat-form-field>

        <p *ngIf="!single" class="m-0 text-xs text-secondary">
          Le montant en caisse ne sera pas renseigné : les caisses seront marquées « montant non compté », sans écart calculé.
        </p>

        <mat-form-field>
          <mat-label>Notes (optionnel)</mat-label>
          <textarea matInput rows="2" [(ngModel)]="notes" placeholder="Ex. caisse oubliée la veille"></textarea>
        </mat-form-field>

        <div *ngIf="error" class="text-sm text-red-600">{{ error }}</div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="close()" [disabled]="saving">Annuler</button>
      <button mat-raised-button color="warn" type="button" (click)="confirm()" [disabled]="saving">
        <mat-spinner *ngIf="saving" diameter="18" class="inline-block mr-2"></mat-spinner>
        {{ confirmLabel }}
      </button>
    </mat-dialog-actions>
  `
})
export class AdminCloseCaisseComponent {
  closingBalance: number | null = null;
  notes = '';
  saving = false;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<AdminCloseCaisseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AdminCloseCaisseData,
    private service: CaisseSessionService
  ) {}

  get single(): CaisseSessionPayload | null {
    return !this.data.all && this.data.sessions.length === 1 ? this.data.sessions[0] : null;
  }

  get count(): number {
    return this.data.all ? (this.data.openCount ?? 0) : this.data.sessions.length;
  }

  get expected(): number {
    const s = this.single;
    return s ? (s.openingBalance ?? 0) + (s.totalSalesAmount ?? 0) : 0;
  }

  get title(): string {
    if (this.data.all) return 'Clôturer toutes les caisses ouvertes';
    return this.single ? 'Clôturer la caisse' : 'Clôturer la sélection';
  }

  get message(): string {
    if (this.single) return 'Cette caisse est toujours ouverte. La clôturer depuis l\'administration ?';
    const n = this.count;
    return this.data.all
      ? `${n} caisse${n > 1 ? 's' : ''} ouverte${n > 1 ? 's' : ''} ${n > 1 ? 'seront clôturées' : 'sera clôturée'}.`
      : `${n} caisses sélectionnées seront clôturées :`;
  }

  get confirmLabel(): string {
    return this.single ? 'Clôturer' : `Clôturer (${this.count})`;
  }

  /** "2026-10-27 14:27:14" → "27/10/2026 14:27" */
  shortDate(value: string): string {
    const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : '—';
  }

  close(): void {
    this.dialogRef.close(null);
  }

  confirm(): void {
    if (this.closingBalance !== null && this.closingBalance !== undefined && this.closingBalance < 0) {
      this.error = 'Le montant compté ne peut pas être négatif.';
      return;
    }
    this.error = null;
    this.saving = true;
    this.service.adminClose({
      all: !!this.data.all,
      ids: this.data.all ? undefined : this.data.sessions.map(s => s.id),
      closingBalance: this.single && this.closingBalance !== undefined ? this.closingBalance : null,
      notes: this.notes?.trim() || null
    }).subscribe({
      next: (closed) => {
        this.saving = false;
        this.dialogRef.close(closed ?? []);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message ?? err?.error?.errorMessage ?? 'Impossible de clôturer. Réessayez.';
      }
    });
  }
}
