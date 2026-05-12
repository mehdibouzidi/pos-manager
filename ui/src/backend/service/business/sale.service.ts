import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RequestsConstants } from '../util/RequestsConstants';
import { ConnectivityService } from '../offline/connectivity.service';
import { PendingQueueService } from '../offline/pending-queue.service';

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
  offline?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  constructor(
    private http: HttpClient,
    private connectivity: ConnectivityService,
    private queue: PendingQueueService
  ) {}

  add(payload: SaleRequest): Observable<SaleResponse> {
    if (this.connectivity.isOnline()) {
      return this.http.post<SaleResponse>(RequestsConstants.SALE_ADD_REQ, payload);
    }
    // Offline: queue for later sync, return a synthetic response
    const orderNumber$ = this.queue.queueSale(payload);
    return new Observable<SaleResponse>(subscriber => {
      orderNumber$.then(localOrderNumber => {
        subscriber.next({
          id: 0,
          orderNumber: localOrderNumber,
          saleDate: new Date().toISOString(),
          totalAmount: payload.totalAmount,
          paymentMethod: payload.paymentMethod,
          offline: true
        });
        subscriber.complete();
      }).catch(err => subscriber.error(err));
    });
  }
}
