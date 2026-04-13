import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestsConstants } from '../util/RequestsConstants';

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

  constructor(private http: HttpClient) {}

  open(payload: { openingBalance: number }): Observable<CaisseSessionPayload> {
    return this.http.post<CaisseSessionPayload>(RequestsConstants.CAISSE_SESSION_OPEN_REQ, payload);
  }

  close(payload: { closingBalance: number; notes?: string }): Observable<CaisseSessionPayload> {
    return this.http.put<CaisseSessionPayload>(RequestsConstants.CAISSE_SESSION_CLOSE_REQ, payload);
  }

  getCurrent(): Observable<CaisseSessionPayload | null> {
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
