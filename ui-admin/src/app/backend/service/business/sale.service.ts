import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SaleCriteria } from '../../criteria/business/sale-criteria';
import { GlobalPayload } from '../../payloads/global/globalpayload';
import { SalePayload } from '../../payloads/business/sale-payload';
import { RequestsConstants } from '../util/RequestsConstants';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  constructor(private http: HttpClient) {}

  /** Tickets (one row per sale, with their lines), newest first by default. */
  findAllByCriteria(criteria: SaleCriteria) {
    return this.http.post<GlobalPayload<SalePayload>>(RequestsConstants.SALE_FINDALL_CRITERIA_REQ, criteria);
  }
}
