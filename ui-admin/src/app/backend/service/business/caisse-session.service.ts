import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CaisseSessionCriteria } from '../../criteria/business/caisse-session-criteria';
import { RequestsConstants } from '../util/RequestsConstants';

@Injectable({
  providedIn: 'root'
})
export class CaisseSessionService {

  constructor(private http: HttpClient) {}

  findAllByCriteria(criteria: CaisseSessionCriteria) {
    return this.http.post(RequestsConstants.CAISSE_SESSION_FINDALL_CRITERIA_REQ, criteria);
  }
}
