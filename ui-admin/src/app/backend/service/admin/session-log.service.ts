import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionLogCriteria } from '../../criteria/admin/session-log-criteria';
import { RequestsConstants } from '../util/RequestsConstants';
import { UtilStatic } from '../util/UtilStatic';

@Injectable({
  providedIn: 'root'
})
export class SessionLogService {

  constructor(private http: HttpClient) {}

  findAllByCriteria(criteria: SessionLogCriteria) {
    return this.http.post(RequestsConstants.SESSION_LOG_FINDALL_CRITERIA_REQ, criteria);
  }

  findAll() {
    return this.http.get(RequestsConstants.SESSION_LOG_FINDALL_REQ);
  }

  get(id: number) {
    return this.http.get(`${RequestsConstants.SESSION_LOG_REQ}${UtilStatic.SLASH}${id}`);
  }
}
