import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiKeyCriteria } from '../../criteria/admin/api-key-criteria';
import { ApiKeyPayload } from '../../payloads/admin/api-key-payload';
import { RequestsConstants } from '../util/RequestsConstants';
import { UtilStatic } from '../util/UtilStatic';

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {

  constructor(private http: HttpClient) {}

  findAllByCriteria(criteria: ApiKeyCriteria) {
    return this.http.post(RequestsConstants.API_KEY_FINDALL_CRITERIA_REQ, criteria);
  }

  findAll() {
    return this.http.get(RequestsConstants.API_KEY_FINDALL_REQ);
  }

  add(payload: ApiKeyPayload) {
    return this.http.post(RequestsConstants.API_KEY_ADD_REQ, payload);
  }

  update(payload: ApiKeyPayload) {
    return this.http.put(RequestsConstants.API_KEY_UPDATE_REQ, payload);
  }

  get(id: number) {
    return this.http.get(`${RequestsConstants.API_KEY_REQ}${UtilStatic.SLASH}${id}`);
  }

  delete(id: number) {
    return this.http.delete(`${RequestsConstants.API_KEY_REQ}${UtilStatic.SLASH}${id}`);
  }

  regenerate(id: number) {
    return this.http.post(`${RequestsConstants.API_KEY_REGENERATE_REQ}${UtilStatic.SLASH}${id}`, {});
  }
}
