import { Component, Input } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';

/**
 * Audit info in a table cell: full name (first line), then login · date and time (second line).
 * The API sends dates as "yyyy-MM-dd HH:mm:ss" (Algiers time), which not every browser
 * parses: it is normalised to ISO before formatting.
 */
@Component({
  selector: 'vex-audit-cell',
  standalone: true,
  imports: [NgIf, DatePipe],
  template: `
    <div *ngIf="name || username || date; else empty" class="leading-tight whitespace-nowrap">
      <div *ngIf="name || username" class="font-medium">{{ name || username }}</div>
      <div class="text-xs text-secondary">
        <span *ngIf="name && username">{{ username }}</span>
        <span *ngIf="name && username && parsedDate"> · </span>
        <span *ngIf="parsedDate">{{ parsedDate | date:'dd/MM/yyyy HH:mm' }}</span>
      </div>
    </div>
    <ng-template #empty><span class="text-secondary">—</span></ng-template>
  `
})
export class AuditCellComponent {
  /** Full name of the user. */
  @Input() name?: string | null;
  /** Login of the user, shown next to the name (or alone when the name is empty). */
  @Input() username?: string | null;
  @Input() date?: string | null;

  get parsedDate(): string | null {
    return this.date ? this.date.replace(' ', 'T') : null;
  }
}
