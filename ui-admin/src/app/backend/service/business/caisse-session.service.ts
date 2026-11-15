import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CaisseSessionCriteria } from '../../criteria/business/caisse-session-criteria';
import { RequestsConstants } from '../util/RequestsConstants';
import { CaisseSessionPayload } from '../../payloads/business/caisse-session-payload';
import { SalePayload } from '../../payloads/business/sale-payload';

@Injectable({
  providedIn: 'root'
})
export class CaisseSessionService {

  constructor(private http: HttpClient) {}

  findAllByCriteria(criteria: CaisseSessionCriteria) {
    return this.http.post(RequestsConstants.CAISSE_SESSION_FINDALL_CRITERIA_REQ, criteria);
  }

  /** Sales (tickets with items) of a caisse session, oldest first. */
  findSales(sessionId: number) {
    return this.http.get<SalePayload[]>(`${RequestsConstants.CAISSE_SESSION_REQ}/${sessionId}/sales`);
  }

  /**
   * Closes caisse sessions left open by the tills: the given ids, or every open one when `all` is true.
   * closingBalance (counted cash) is only taken into account for a single session.
   */
  adminClose(request: { ids?: number[]; all?: boolean; closingBalance?: number | null; notes?: string | null }) {
    return this.http.put<CaisseSessionPayload[]>(RequestsConstants.CAISSE_SESSION_ADMIN_CLOSE_REQ, request);
  }
}
