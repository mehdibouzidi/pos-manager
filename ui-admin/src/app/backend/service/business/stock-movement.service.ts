import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StockMovementCriteria } from '../../criteria/business/stock-movement-criteria';
import { StockMovementPayload } from '../../payloads/business/stock-movement-payload';
import { RequestsConstants } from '../util/RequestsConstants';
import { UtilStatic } from '../util/UtilStatic';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {

  constructor(private http: HttpClient) {}

  findAllByCriteria(criteria: StockMovementCriteria) {
    return this.http.post(RequestsConstants.STOCK_MOVEMENT_FINDALL_CRITERIA_REQ, criteria);
  }

  findAll() {
    return this.http.get(RequestsConstants.STOCK_MOVEMENT_FINDALL_REQ);
  }

  add(payload: StockMovementPayload) {
    return this.http.post(RequestsConstants.STOCK_MOVEMENT_ADD_REQ, payload);
  }

  update(payload: StockMovementPayload) {
    return this.http.put(RequestsConstants.STOCK_MOVEMENT_UPDATE_REQ, payload);
  }

  get(id: number) {
    return this.http.get(`${RequestsConstants.STOCK_MOVEMENT_REQ}${UtilStatic.SLASH}${id}`);
  }

  delete(id: number) {
    return this.http.delete(`${RequestsConstants.STOCK_MOVEMENT_REQ}${UtilStatic.SLASH}${id}`);
  }
}
