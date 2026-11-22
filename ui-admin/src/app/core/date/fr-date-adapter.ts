import { Injectable } from '@angular/core';
import { MatDateFormats, NativeDateAdapter } from '@angular/material/core';

/**
 * Native date adapter for the French back-office: weeks start on Monday, dates are shown
 * as dd/MM/yyyy and typed dates are read as dd/MM/yyyy (the native adapter reads them as MM/dd).
 */
@Injectable()
export class FrDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
    return 1;
  }

  override parse(value: any, parseFormat?: any): Date | null {
    if (typeof value === 'string') {
      const m = /^\s*(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2}|\d{4})\s*$/.exec(value);
      if (m) {
        const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
        const date = new Date(year, +m[2] - 1, +m[1]);
        // Rejects impossible dates such as 31/02 instead of rolling them over
        return date.getMonth() === +m[2] - 1 && date.getDate() === +m[1] ? date : this.invalid();
      }
      if (value.trim() === '') {
        return null;
      }
    }
    return super.parse(value, parseFormat);
  }

  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    }
    return super.format(date, displayFormat);
  }
}

export const FR_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: 'input' },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'long' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};
