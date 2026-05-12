import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, lastValueFrom } from 'rxjs';
import { ConnectivityService } from './connectivity.service';
import { PendingQueueService } from './pending-queue.service';
import { OfflineStorageService, PendingOperation } from './offline-storage.service';
import { UtilStatic } from '../util/UtilStatic';
import { RequestsConstants } from '../util/RequestsConstants';

export interface SyncBatchRequest {
  openSession?: any;
  sales?: any[];
  closeSession?: any;
}

export interface SaleSyncResult {
  localId: string;
  orderNumber: number;
  success: boolean;
  error?: string;
}

export interface SyncBatchResult {
  openSessionResult?: any;
  salesResults?: SaleSyncResult[];
  closeSessionResult?: any;
  openSessionError?: string;
  closeSessionError?: string;
}

const SYNC_INTERVAL_MS = 30_000; // retry every 30 s when pending ops exist

@Injectable({ providedIn: 'root' })
export class SyncService {

  private _syncing = signal<boolean>(false);
  private _pendingCount = signal<number>(0);
  private _lastSyncError = signal<string | null>(null);

  private _syncCompleted = new Subject<void>();
  /** Emits each time a batch sync completes successfully (at least one op processed) */
  readonly syncCompleted$ = this._syncCompleted.asObservable();

  readonly syncing = this._syncing.asReadonly();
  readonly pendingCount = this._pendingCount.asReadonly();
  readonly lastSyncError = this._lastSyncError.asReadonly();

  constructor(
    private http: HttpClient,
    private connectivity: ConnectivityService,
    private queue: PendingQueueService,
    private storage: OfflineStorageService
  ) {
    // Flush whenever connectivity transitions to online
    this.connectivity.online$.subscribe(() => this.flush());

    // Initial count + attempt at startup
    this.refreshPendingCount().then(count => {
      if (count > 0 && this.connectivity.isOnline()) {
        this.flush();
      }
    });

    // Periodic retry — catches cases where online$ didn't fire
    setInterval(() => {
      if (this._pendingCount() > 0 && this.connectivity.isOnline() && !this._syncing()) {
        this.flush();
      }
    }, SYNC_INTERVAL_MS);
  }

  async refreshPendingCount(): Promise<number> {
    const ops = await this.queue.getPendingOps();
    this._pendingCount.set(ops.length);
    return ops.length;
  }

  async flush(): Promise<void> {
    if (this._syncing()) return;

    try {
      const ops = await this.queue.getPendingOps();
      console.log(`[SyncService] flush() — ${ops.length} op(s) en attente`);

      if (ops.length === 0) {
        this._lastSyncError.set(null); // clear stale error when nothing left to sync
        return;
      }

      // If API key missing, try to fetch it now (JWT cookie may still be valid)
      let apiKey = localStorage.getItem(UtilStatic.API_KEY);
      console.log(`[SyncService] apiKey: ${apiKey ? 'présente' : 'MANQUANTE'}`);
      if (!apiKey) {
        apiKey = await this.tryFetchApiKey();
      }
      if (!apiKey) {
        this._lastSyncError.set('Clé API introuvable. Reconnectez-vous pour activer la synchronisation.');
        return;
      }

      this._syncing.set(true);
      this._lastSyncError.set(null);

      try {
        const batchRequest = this.buildBatchRequest(ops);
        const headers = new HttpHeaders({ 'X-Api-Key': apiKey });
        console.log('[SyncService] POST /sync/batch →', batchRequest);

        const result = await lastValueFrom(
          this.http.post<SyncBatchResult>(RequestsConstants.SYNC_BATCH_REQ, batchRequest, { headers })
        );
        console.log('[SyncService] Réponse sync:', result);

        if (result) {
          const processedIds = this.resolveProcessedIds(ops, result);
          await this.queue.deletePendingOps(processedIds);

          const failedSales = result.salesResults?.filter(r => !r.success) ?? [];
          if (failedSales.length > 0) {
            this._lastSyncError.set(`${failedSales.length} vente(s) en échec lors de la synchro.`);
          }

          // Clear offline session if close was successful
          if (result.closeSessionResult && !result.closeSessionError) {
            this.queue.clearOfflineSession();
            // Seed counter from max server-assigned order number so next offline
            // session continues from the right number instead of resetting to 1
            const maxSyncedOrder = Math.max(
              0,
              ...(result.salesResults?.filter(r => r.success && r.orderNumber).map(r => r.orderNumber) ?? [])
            );
            if (maxSyncedOrder > 0) {
              this.queue.seedOrderCounter(maxSyncedOrder);
            } else {
              this.queue.resetOrderCounter();
            }
          }

          // Notify subscribers (e.g. MenuService) to refresh stock
          this._syncCompleted.next();
        }
      } catch (err: any) {
        const msg = err?.error?.message ?? err?.message ?? 'Erreur réseau lors de la synchronisation.';
        this._lastSyncError.set(msg);
        console.error('[SyncService] Sync failed:', err);
      } finally {
        this._syncing.set(false);
        await this.refreshPendingCount();
      }

    } catch (outerErr) {
      console.error('[SyncService] Erreur inattendue dans flush():', outerErr);
    }
  }

  private buildBatchRequest(ops: PendingOperation[]): SyncBatchRequest {
    const request: SyncBatchRequest = {};
    const sales: any[] = [];

    for (const op of ops) {
      if (op.type === 'OPEN_SESSION') request.openSession = op.payload;
      else if (op.type === 'SALE') sales.push(op.payload);
      else if (op.type === 'CLOSE_SESSION') request.closeSession = op.payload;
    }

    if (sales.length > 0) request.sales = sales;
    return request;
  }

  /** Fetch the API key on-demand using the current JWT session cookie. */
  private async tryFetchApiKey(): Promise<string | null> {
    try {
      const payload = await lastValueFrom(
        this.http.get<any>(RequestsConstants.API_KEY_CURRENT_POS_REQ)
      );
      if (payload?.keyValue) {
        localStorage.setItem(UtilStatic.API_KEY, payload.keyValue);
        console.info('[SyncService] API key fetched and stored.');
        return payload.keyValue;
      }
      console.warn('[SyncService] No active API key found for this POS terminal.');
      return null;
    } catch (err) {
      console.warn('[SyncService] Could not fetch API key:', err);
      return null;
    }
  }

  private resolveProcessedIds(ops: PendingOperation[], result: SyncBatchResult): number[] {
    const ids: number[] = [];

    for (const op of ops) {
      if (op.id == null) continue;

      if (op.type === 'OPEN_SESSION' && result.openSessionResult && !result.openSessionError) {
        ids.push(op.id);
      } else if (op.type === 'SALE') {
        const saleResult = result.salesResults?.find(r => r.localId === op.localId);
        if (saleResult?.success) ids.push(op.id);
      } else if (op.type === 'CLOSE_SESSION' && result.closeSessionResult && !result.closeSessionError) {
        ids.push(op.id);
      }
    }

    return ids;
  }
}
