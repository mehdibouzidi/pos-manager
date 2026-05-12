import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RequestsConstants } from '../util/RequestsConstants';
import { ConnectivityService } from '../offline/connectivity.service';
import { PendingQueueService } from '../offline/pending-queue.service';

export interface CaisseSessionPayload {
  id?: number;
  openedAt?: string;
  closedAt?: string;
  openingBalance?: number;
  closingBalance?: number;
  totalSalesAmount?: number;
  totalSalesCount?: number;
  firstOrderNumber?: number;
  lastOrderNumber?: number;
  variance?: number;
  status?: string;
  notes?: string;
  posId?: number;
  posCode?: string;
  posName?: string;
  createdByFullName?: string;
}

@Injectable({ providedIn: 'root' })
export class CaisseSessionService {
  private _currentSession = signal<CaisseSessionPayload | null>(null);
  private _openModalVisible = signal<boolean>(false);
  private _closeModalVisible = signal<boolean>(false);

  readonly currentSession = this._currentSession.asReadonly();
  readonly openModalVisible = this._openModalVisible.asReadonly();
  readonly closeModalVisible = this._closeModalVisible.asReadonly();

  constructor(
    private http: HttpClient,
    private connectivity: ConnectivityService,
    private queue: PendingQueueService
  ) {}

  open(payload: { openingBalance: number }): Observable<CaisseSessionPayload> {
    if (this.connectivity.isOnline()) {
      return this.http.post<CaisseSessionPayload>(RequestsConstants.CAISSE_SESSION_OPEN_REQ, payload);
    }
    // Offline: queue + persist locally
    const syntheticSession: CaisseSessionPayload = {
      openingBalance: payload.openingBalance,
      openedAt: new Date().toISOString(),
      status: 'OPEN'
    };
    this.queue.saveOfflineSession(syntheticSession);
    return new Observable<CaisseSessionPayload>(sub => {
      this.queue.queueOpenSession(payload).then(() => {
        sub.next(syntheticSession);
        sub.complete();
      }).catch(err => sub.error(err));
    });
  }

  close(payload: { closingBalance: number; notes?: string }): Observable<CaisseSessionPayload> {
    if (this.connectivity.isOnline()) {
      return this.http.put<CaisseSessionPayload>(RequestsConstants.CAISSE_SESSION_CLOSE_REQ, payload);
    }
    // Offline: queue + clear local session
    const offlineSession = this.queue.getOfflineSession() ?? {};
    const syntheticSession: CaisseSessionPayload = {
      ...offlineSession,
      closingBalance: payload.closingBalance,
      notes: payload.notes,
      closedAt: new Date().toISOString(),
      status: 'CLOSED'
    };
    return new Observable<CaisseSessionPayload>(sub => {
      this.queue.queueCloseSession(payload).then(() => {
        this.queue.clearOfflineSession();
        sub.next(syntheticSession);
        sub.complete();
      }).catch(err => sub.error(err));
    });
  }

  getCurrent(): Observable<CaisseSessionPayload | null> {
    if (!this.connectivity.isOnline()) {
      // If a session was opened offline, return it from localStorage
      const localSession = this.queue.getOfflineSession();
      if (localSession) return of(localSession);
      // No local session — try the API anyway (connectivity detection can be imprecise)
    }
    return this.http.get<CaisseSessionPayload | null>(RequestsConstants.CAISSE_SESSION_CURRENT_REQ);
  }

  setCurrentSession(session: CaisseSessionPayload | null): void {
    this._currentSession.set(session);
  }

  showOpenModal(): void {
    this._openModalVisible.set(true);
  }

  hideOpenModal(): void {
    this._openModalVisible.set(false);
  }

  showCloseModal(): void {
    this._closeModalVisible.set(true);
  }

  hideCloseModal(): void {
    this._closeModalVisible.set(false);
  }
}
