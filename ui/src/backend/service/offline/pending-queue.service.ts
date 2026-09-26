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

  // localId travels in the payload so the server can deduplicate replays;
  // openedAt / closedAt / saleDate keep the real time of the operation, not the sync time.

  async queueOpenSession(payload: { openingBalance: number }, openedAt: string, localId = this.generateUuid()): Promise<void> {
    await this.storage.addPendingOp({
      type: 'OPEN_SESSION',
      payload: { ...payload, localId, openedAt },
      localId,
      timestamp: openedAt
    });
  }

  async queueSale(payload: SaleRequest, localId = this.generateUuid()): Promise<number> {
    const localOrderNumber = this.getNextLocalOrderNumber();
    const now = new Date().toISOString();
    await this.storage.addPendingOp({
      type: 'SALE',
      payload: { ...payload, localId, localOrderNumber, saleDate: now },
      localId,
      timestamp: now,
      localOrderNumber
    });
    return localOrderNumber;
  }

  async queueCloseSession(payload: { closingBalance: number; notes?: string }, closedAt: string, localId = this.generateUuid()): Promise<void> {
    await this.storage.addPendingOp({
      type: 'CLOSE_SESSION',
      payload: { ...payload, localId, closedAt },
      localId,
      timestamp: closedAt
    });
  }

  async getPendingOps(): Promise<PendingOperation[]> {
    return this.storage.getPendingOps();
  }

  async deletePendingOps(ids: number[]): Promise<void> {
    return this.storage.deletePendingOps(ids);
  }

  /** Marks operations rejected by the server: they are kept locally but no longer sent automatically. */
  async markFailed(failures: Array<{ op: PendingOperation; error: string }>): Promise<void> {
    return this.storage.putPendingOps(failures.map(f => ({ ...f.op, failed: true, error: f.error })));
  }

  /** Puts rejected operations back in the automatic sync (e.g. after the cashier reopened the caisse). */
  async retryFailed(): Promise<void> {
    const failed = (await this.storage.getPendingOps()).filter(op => op.failed);
    return this.storage.putPendingOps(failed.map(op => ({ ...op, failed: false, error: undefined })));
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

  generateUuid(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
