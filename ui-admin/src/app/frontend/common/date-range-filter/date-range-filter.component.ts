import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDateRangePicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

/** Range emitted to the list pages, in the backend criteria format (yyyy-MM-dd, both bounds inclusive). */
export interface DateRange {
  from: string | null;
  to: string | null;
}

interface Preset {
  label: string;
  range: () => [Date, Date];
}

/**
 * "Période" filter for the list toolbars: one Material date-range field (calendar in French,
 * typed dates as dd/MM/yyyy), quick presets (today, yesterday, 7 days, this month…) and a clear button.
 * Replaces the browser's native date inputs, whose look and format depended on the browser.
 */
@Component({
  selector: 'vex-date-range-filter',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  host: { class: 'block date-range-filter' },
  template: `
    <mat-form-field class="w-full">
      <mat-label>{{ label }}</mat-label>
      <mat-date-range-input [formGroup]="range" [rangePicker]="picker">
        <input matStartDate formControlName="start" placeholder="Début" (dateChange)="onTyped()" />
        <input matEndDate formControlName="end" placeholder="Fin" (dateChange)="onTyped()" />
      </mat-date-range-input>
      <div matSuffix class="flex items-center">
        <button *ngIf="hasValue" mat-icon-button type="button" (click)="clear()" matTooltip="Effacer la période">
          <mat-icon svgIcon="mat:close" class="icon-sm"></mat-icon>
        </button>
        <button mat-icon-button type="button" [matMenuTriggerFor]="presetsMenu" matTooltip="Périodes rapides">
          <mat-icon svgIcon="mat:bolt" class="icon-sm"></mat-icon>
        </button>
        <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
      </div>
      <mat-date-range-picker #picker (closed)="onPickerClosed()"></mat-date-range-picker>
    </mat-form-field>

    <mat-menu #presetsMenu="matMenu" xPosition="before">
      <button mat-menu-item *ngFor="let p of presets" type="button" (click)="applyPreset(p)">{{ p.label }}</button>
    </mat-menu>
  `
})
export class DateRangeFilterComponent implements OnChanges {
  @Input() label = 'Période';
  /** Current bounds, as stored in the criteria (yyyy-MM-dd or null). */
  @Input() from: string | null = null;
  @Input() to: string | null = null;
  @Output() rangeChange = new EventEmitter<DateRange>();
  @ViewChild('picker') picker: MatDateRangePicker<Date>;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  });

  presets: Preset[] = [
    { label: "Aujourd'hui", range: () => [today(), today()] },
    { label: 'Hier', range: () => [addDays(today(), -1), addDays(today(), -1)] },
    { label: '7 derniers jours', range: () => [addDays(today(), -6), today()] },
    { label: '30 derniers jours', range: () => [addDays(today(), -29), today()] },
    { label: 'Ce mois-ci', range: () => [new Date(today().getFullYear(), today().getMonth(), 1), today()] },
    {
      label: 'Mois dernier',
      range: () => [new Date(today().getFullYear(), today().getMonth() - 1, 1), new Date(today().getFullYear(), today().getMonth(), 0)]
    }
  ];

  /** Last emitted value, so the same range is not searched twice (picker close + dateChange). */
  private lastEmitted = '';

  get hasValue(): boolean {
    return !!(this.range.value.start || this.range.value.end);
  }

  ngOnChanges(): void {
    this.range.setValue({ start: fromIso(this.from), end: fromIso(this.to) }, { emitEvent: false });
    this.lastEmitted = key(this.from, this.to);
  }

  /** Picker closed: search once the range is complete (or emptied). A lone start date waits for the end. */
  onPickerClosed(): void {
    const { start, end } = this.range.value;
    if (start && !end) {
      this.range.controls.end.setValue(start);
    }
    this.emit();
  }

  /** Date typed by hand (dd/MM/yyyy) and validated on blur/enter. */
  onTyped(): void {
    if (this.picker?.opened) {
      return; // picking in the calendar: searched once, when it closes
    }
    const { start, end } = this.range.value;
    if (start && end && start > end) {
      return;
    }
    this.emit();
  }

  applyPreset(preset: Preset): void {
    const [start, end] = preset.range();
    this.range.setValue({ start, end });
    this.emit();
  }

  clear(): void {
    this.range.setValue({ start: null, end: null });
    this.emit();
  }

  private emit(): void {
    const from = toIso(this.range.value.start);
    const to = toIso(this.range.value.end);
    const k = key(from, to);
    if (k === this.lastEmitted) {
      return;
    }
    this.lastEmitted = k;
    this.rangeChange.emit({ from, to });
  }
}

function today(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

/** Local date → yyyy-MM-dd (no UTC shift, unlike toISOString). */
function toIso(d: Date | null | undefined): string | null {
  return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : null;
}

function fromIso(s: string | null | undefined): Date | null {
  const m = s ? /^(\d{4})-(\d{2})-(\d{2})/.exec(s) : null;
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

function key(from: string | null, to: string | null): string {
  return `${from ?? ''}|${to ?? ''}`;
}
