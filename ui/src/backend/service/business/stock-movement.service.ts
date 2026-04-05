import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestsConstants } from '../util/RequestsConstants';

export interface SaleMovementPayload {
  productId: number;
  movementType: string;
  quantity: number;
  movementDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {

  constructor(private http: HttpClient) {}

  add(payload: SaleMovementPayload): Observable<any> {
    return this.http.post(RequestsConstants.STOCK_MOVEMENT_ADD_REQ, payload);
  }
}
