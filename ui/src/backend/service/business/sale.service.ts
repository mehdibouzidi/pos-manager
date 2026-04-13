import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestsConstants } from '../util/RequestsConstants';

export interface SaleItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface SaleRequest {
  totalAmount: number;
  paymentMethod: string;
  items: SaleItemRequest[];
}

export interface SaleResponse {
  id: number;
  orderNumber: number;
  saleDate: string;
  totalAmount: number;
  paymentMethod: string;
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  constructor(private http: HttpClient) {}

  add(payload: SaleRequest): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(RequestsConstants.SALE_ADD_REQ, payload);
  }
}
