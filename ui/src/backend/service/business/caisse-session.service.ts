import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, defer, of, switchMap, tap, throwError } from 'rxjs';
import { RequestsConstants } from '../util/RequestsConstants';
import { ConnectivityService } from '../offline/connectivity.service';
import { PendingQueueService } from '../offline/pending-queue.service';
import { SyncService } from '../offline/sync.service';

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
    private queue: PendingQueueService,
    private sync: SyncService
  ) {
    // Once offline operations reach the server, take the server's view of the session (real id, totals…)
    this.sync.syncCompleted$.subscribe(() => {
      if (this.connectivity.isOnline()) this.loadCurrent(false);
    });
  }

  /**
   * Loads the current session and publishes it. The local snapshot is used whenever the server
   * cannot be trusted yet (offline, or open/close operations still waiting to be synced).
   */
  loadCurrent(promptIfNone = true): void {
    this.getCurrent().subscribe({
      next: (session) => {
        this._currentSession.set(session);
        if (session) {
          // Seed the offline order counter so offline sales continue from the right number
          if (session.firstOrderNumber != null) {
            const currentMax = session.firstOrderNumber + (session.totalSalesCount ?? 0) - 1;
            this.queue.seedOrderCounter(Math.max(0, currentMax));
          }
        } else if (promptIfNone) {
          this.showOpenModal();
        }
      },
      error: () => {
        const local = this.queue.getOfflineSession();
        this._currentSession.set(local);
        if (!local && promptIfNone) this.showOpenModal();
      }
    });
  }

  /**
   * Keeps the running totals of the current session up to date after each sale (online or offline),
   * so that an offline close shows and prints the right expected balance and variance.
   * The server totals replace them at the next online load.
   */
  recordSale(amount: number, orderNumber?: number): void {
    const current = this._currentSession();
    if (!current) return;
    const updated: CaisseSessionPayload = {
      ...current,
      totalSalesAmount: Math.round(((current.totalSalesAmount ?? 0) + amount) * 100) / 100,
      totalSalesCount: (current.totalSalesCount ?? 0) + 1,
      firstOrderNumber: current.firstOrderNumber ?? orderNumber,
      lastOrderNumber: orderNumber ?? current.lastOrderNumber
    };
    this._currentSession.set(updated);
    this.queue.saveOfflineSession(updated);
  }

  open(payload: { openingBalance: number }): Observable<CaisseSessionPayload> {
    const localId = this.queue.generateUuid();
    const openedAt = new Date().toISOString();
    if (!this.connectivity.isOnline()) {
      return this.openOffline(payload, localId, openedAt);
    }
    return this.http.post<CaisseSessionPayload>(RequestsConstants.CAISSE_SESSION_OPEN_REQ, { ...payload, localId }).pipe(
      tap(session => this.queue.saveOfflineSession(session)),
      catchError((err: HttpErrorResponse) => {
        if (this.isNetworkError(err)) {
          this.connectivity.markOffline();
          // Same localId: if the server did open it before the connection dropped, the sync is deduplicated
          return this.openOffline(payload, localId, openedAt);
        }
        return throwError(() => err);
      })
    );
  }

  close(payload: { closingBalance: number; notes?: string }): Observable<CaisseSessionPayload> {
    const localId = this.queue.generateUuid();
    const closedAt = new Date().toISOString();
    if (!this.connectivity.isOnline()) {
      return this.closeOffline(payload, localId, closedAt);
    }
    return this.http.put<CaisseSessionPayload>(RequestsConstants.CAISSE_SESSION_CLOSE_REQ, { ...payload, localId }).pipe(
      // A session closed online must not survive as a local snapshot, otherwise the next offline
      // start would believe the caisse is still open and queue sales outside any session.
      tap(() => this.queue.clearOfflineSession()),
      catchError((err: HttpErrorResponse) => {
        if (this.isNetworkError(err)) {
          this.connectivity.markOffline();
          return this.closeOffline(payload, localId, closedAt);
        }
        return throwError(() => err);
      })
    );
  }

  getCurrent(): Observable<CaisseSessionPayload | null> {
    if (!this.connectivity.isOnline()) {
      return of(this.queue.getOfflineSession());
    }
    return defer(async () => {
      // Push offline operations first: before that, the server does not know about a session
      // opened (or closed) offline and would wrongly answer "no session" (→ second session opened).
      await this.sync.flush();
      const pending = (await this.queue.getPendingOps()).filter(op => !op.failed);
      return pending.some(op => op.type === 'OPEN_SESSION' || op.type === 'CLOSE_SESSION');
    }).pipe(
      switchMap(sessionOpsPending => sessionOpsPending
        ? of(this.queue.getOfflineSession())
        : this.http.get<CaisseSessionPayload | null>(RequestsConstants.CAISSE_SESSION_CURRENT_REQ).pipe(
            tap(session => session ? this.queue.saveOfflineSession(session) : this.queue.clearOfflineSession()),
            catchError((err: HttpErrorResponse) => {
              if (this.isNetworkError(err)) {
                this.connectivity.markOffline();
                return of(this.queue.getOfflineSession());
              }
              return throwError(() => err);
            })
          ))
    );
  }

  private openOffline(payload: { openingBalance: number }, localId: string, openedAt: string): Observable<CaisseSessionPayload> {
    const syntheticSession: CaisseSessionPayload = {
      openingBalance: payload.openingBalance,
      openedAt,
      status: 'OPEN'
    };
    return new Observable<CaisseSessionPayload>(sub => {
      this.queue.queueOpenSession(payload, openedAt, localId).then(() => {
        this.queue.saveOfflineSession(syntheticSession);
        sub.next(syntheticSession);
        sub.complete();
      }).catch(err => sub.error(err));
    });
  }

  private closeOffline(payload: { closingBalance: number; notes?: string }, localId: string, closedAt: string): Observable<CaisseSessionPayload> {
    const offlineSession = this.queue.getOfflineSession() ?? {};
    const expected = (offlineSession.openingBalance ?? 0) + (offlineSession.totalSalesAmount ?? 0);
    const syntheticSession: CaisseSessionPayload = {
      ...offlineSession,
      closingBalance: payload.closingBalance,
      variance: Math.round((payload.closingBalance - expected) * 100) / 100,
      notes: payload.notes,
      closedAt,
      status: 'CLOSED'
    };
    return new Observable<CaisseSessionPayload>(sub => {
      this.queue.queueCloseSession(payload, closedAt, localId).then(() => {
        this.queue.clearOfflineSession();
        sub.next(syntheticSession);
        sub.complete();
      }).catch(err => sub.error(err));
    });
  }

  private isNetworkError(err: HttpErrorResponse): boolean {
    return err.status === 0 || err.status >= 500;
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
