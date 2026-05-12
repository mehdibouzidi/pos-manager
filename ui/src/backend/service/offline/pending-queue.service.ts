import { Injectable } from '@angular/core';
import { OfflineStorageService, PendingOperation } from './offline-storage.service';
import { SaleRequest } from '../business/sale.service';
import { CaisseSessionPayload } from '../business/caisse-session.service';
import { UtilStatic } from '../util/UtilStatic';

const ORDER_COUNTER_KEY = 'pos-offline-order-counter';

@Injectable({ providedIn: 'root' })
export class PendingQueueService {

  constructor(private storage: OfflineStorageService) {}

  // ── Local order number counter ──────────────────────────────────────────────

  getNextLocalOrderNumber(): number {
    const current = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) ?? '0', 10);
    const next = current + 1;
    localStorage.setItem(ORDER_COUNTER_KEY, next.toString());
    return next;
  }

  resetOrderCounter(): void {
    localStorage.removeItem(ORDER_COUNTER_KEY);
  }

  /**
   * Seeds the order counter to `max` only if max is greater than the current value.
   * Call this after loading an online session or after a sync, so offline sales
   * continue from the correct order number.
   */
  seedOrderCounter(max: number): void {
    const current = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) ?? '0', 10);
    if (max > current) {
      localStorage.setItem(ORDER_COUNTER_KEY, max.toString());
    }
  }

  // ── Queue operations ────────────────────────────────────────────────────────

  async queueOpenSession(payload: { openingBalance: number }): Promise<void> {
    await this.storage.addPendingOp({
      type: 'OPEN_SESSION',
      payload,
      localId: this.generateUuid(),
      timestamp: new Date().toISOString()
    });
  }

  async queueSale(payload: SaleRequest): Promise<number> {
    const localOrderNumber = this.getNextLocalOrderNumber();
    const localId = this.generateUuid();
    await this.storage.addPendingOp({
      type: 'SALE',
      payload: { ...payload, localId, saleDate: new Date().toISOString() },
      localId,
      timestamp: new Date().toISOString(),
      localOrderNumber
    });
    return localOrderNumber;
  }

  async queueCloseSession(payload: { closingBalance: number; notes?: string }): Promise<void> {
    await this.storage.addPendingOp({
      type: 'CLOSE_SESSION',
      payload,
      localId: this.generateUuid(),
      timestamp: new Date().toISOString()
    });
  }

  async getPendingOps(): Promise<PendingOperation[]> {
    return this.storage.getPendingOps();
  }

  async deletePendingOps(ids: number[]): Promise<void> {
    return this.storage.deletePendingOps(ids);
  }

  // ── Offline session in localStorage ────────────────────────────────────────

  saveOfflineSession(session: CaisseSessionPayload): void {
    localStorage.setItem(UtilStatic.OFFLINE_SESSION, JSON.stringify(session));
  }

  getOfflineSession(): CaisseSessionPayload | null {
    const raw = localStorage.getItem(UtilStatic.OFFLINE_SESSION);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  clearOfflineSession(): void {
    localStorage.removeItem(UtilStatic.OFFLINE_SESSION);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
