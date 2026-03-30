import { Injectable } from '@angular/core';
import { BusinessValuesConstants } from './BusinessValuesConstants';

@Injectable({ providedIn: 'root' })
export class BusinessValuesService {
  readonly productStandardTypes = BusinessValuesConstants.PRODUCT_STANDARD_TYPES;
}
