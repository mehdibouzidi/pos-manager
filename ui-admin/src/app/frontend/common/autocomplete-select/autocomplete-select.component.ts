import { Component, EventEmitter, forwardRef, Input, OnChanges, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AutocompleteOption {
  value: any;
  label: string;
  /** Extra text matched by the search but not displayed in the field (e.g. a product code). */
  hint?: string;
  /** Optional second line in the option list (also searchable). */
  sublabel?: string;
  /** Optional small status pill shown at the end of the first line. */
  badge?: { text: string; cssClass?: string };
}

/**
 * Single-value select rendered as an autocomplete: type to filter, pick an option, clear with ✕.
 * Works with formControlName / [formControl] / [(ngModel)]; the bound value is the option's `value`.
 * Typing text that matches no option leaves the value unchanged until an option is picked;
 * emptying the field resets the value to null.
 */
@Component({
  selector: 'vex-autocomplete-select',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  // Behaves like a mat-form-field in layouts (block, full width of its slot)
  host: { class: 'block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutocompleteSelectComponent), multi: true }],
  template: `
    <mat-form-field [appearance]="appearance" class="w-full">
      <mat-label>{{ label }}</mat-label>
      <input matInput [formControl]="textCtrl" [matAutocomplete]="auto" [placeholder]="placeholder" [required]="required"
             (input)="onInput()" (blur)="onTouched()" />
      <button *ngIf="textCtrl.value && !disabled && clearable" matSuffix mat-icon-button type="button"
              (click)="clear()" aria-label="Effacer">
        <mat-icon svgIcon="mat:close" class="icon-sm"></mat-icon>
      </button>
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="select($event)">
        <mat-option *ngFor="let o of filtered" [value]="o" [class.two-lines]="!!o.sublabel">
          <div class="flex items-center gap-2">
            <span>{{ o.label }}<span *ngIf="o.hint && !o.sublabel" class="text-secondary"> ({{ o.hint }})</span></span>
            <span *ngIf="o.badge" class="text-xs font-semibold px-2 py-0.5 rounded-full" [ngClass]="o.badge.cssClass">{{ o.badge.text }}</span>
          </div>
          <div *ngIf="o.sublabel" class="text-xs text-secondary leading-tight">{{ o.sublabel }}</div>
        </mat-option>
      </mat-autocomplete>
      <mat-hint *ngIf="hint && !error">{{ hint }}</mat-hint>
      <mat-hint *ngIf="error" class="mat-mdc-form-field-error">{{ error }}</mat-hint>
    </mat-form-field>
  `,
  styles: [`
    /* Two-line options need more height than Material's single-line default */
    ::ng-deep .mat-mdc-option.two-lines { min-height: 56px; padding-top: 6px; padding-bottom: 6px; }
  `]
})
export class AutocompleteSelectComponent implements ControlValueAccessor, OnChanges {
  @Input() label = '';
  @Input() placeholder = 'Rechercher...';
  @Input() options: AutocompleteOption[] = [];
  /** Leave unset to use the app-wide default (outline), like every other field. */
  @Input() appearance?: MatFormFieldAppearance;
  @Input() clearable = true;
  /** Marks the label with * like other required fields (validation stays on the parent control). */
  @Input() required = false;
  @Input() hint?: string;
  /** Error text shown under the field; the parent passes it only when its control is invalid. */
  @Input() error?: string | null;
  /** Emits the selected value (null when cleared), in addition to the form binding. */
  @Output() valueChange = new EventEmitter<any>();

  textCtrl = new FormControl<string | AutocompleteOption>('');
  filtered: AutocompleteOption[] = [];
  disabled = false;

  private value: any = null;
  private onChange: (v: any) => void = () => {};
  onTouched: () => void = () => {};

  ngOnChanges(): void {
    // Options often arrive after the value (async load): refresh the displayed label
    this.filtered = this.options ?? [];
    this.showValue();
  }

  writeValue(value: any): void {
    this.value = value ?? null;
    this.showValue();
  }

  registerOnChange(fn: (v: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    disabled ? this.textCtrl.disable({ emitEvent: false }) : this.textCtrl.enable({ emitEvent: false });
  }

  onInput(): void {
    const text = (typeof this.textCtrl.value === 'string' ? this.textCtrl.value : '').toLowerCase().trim();
    this.filtered = (this.options ?? []).filter(o =>
      o.label?.toLowerCase().includes(text) || o.hint?.toLowerCase().includes(text)
      || o.sublabel?.toLowerCase().includes(text));
    if (!text) this.update(null);
  }

  select(event: MatAutocompleteSelectedEvent): void {
    const option: AutocompleteOption = event.option.value;
    this.textCtrl.setValue(option.label, { emitEvent: false });
    this.filtered = this.options ?? [];
    this.update(option.value);
  }

  clear(): void {
    this.textCtrl.setValue('', { emitEvent: false });
    this.filtered = this.options ?? [];
    this.update(null);
  }

  private update(value: any): void {
    if (value === this.value) return;
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  private showValue(): void {
    const option = (this.options ?? []).find(o => o.value === this.value);
    this.textCtrl.setValue(option ? option.label : '', { emitEvent: false });
  }
}
