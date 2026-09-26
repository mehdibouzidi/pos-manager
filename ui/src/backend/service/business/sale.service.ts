import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
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
    // Client id sent online AND reused if the sale falls back to the offline queue:
    // if the server did save it before the connection dropped, the sync is deduplicated.
    const localId = this.queue.generateUuid();
    if (!this.connectivity.isOnline()) {
      return this.queueOffline(payload, localId);
    }
    return this.http.post<SaleResponse>(RequestsConstants.SALE_ADD_REQ, { ...payload, localId }).pipe(
      catchError((err: HttpErrorResponse) => {
        // Network failure or server down: keep the sale locally instead of losing it.
        // A 4xx is a business rejection (no open session, unknown product…) and is surfaced to the caller.
        if (err.status === 0 || err.status >= 500) {
          this.connectivity.markOffline();
          return this.queueOffline(payload, localId);
        }
        return throwError(() => err);
      })
    );
  }

  private queueOffline(payload: SaleRequest, localId: string): Observable<SaleResponse> {
    return new Observable<SaleResponse>(subscriber => {
      this.queue.queueSale(payload, localId).then(localOrderNumber => {
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
