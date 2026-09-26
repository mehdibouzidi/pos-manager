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
  private _failedCount = signal<number>(0);
  private _lastSyncError = signal<string | null>(null);

  private _syncCompleted = new Subject<void>();
  /** Emits each time a sync run completes (at least one op processed) */
  readonly syncCompleted$ = this._syncCompleted.asObservable();

  readonly syncing = this._syncing.asReadonly();
  /** Operations still waiting to be sent */
  readonly pendingCount = this._pendingCount.asReadonly();
  /** Operations rejected by the server, kept locally for review / manual retry */
  readonly failedCount = this._failedCount.asReadonly();
  readonly lastSyncError = this._lastSyncError.asReadonly();

  /** Single in-flight run: every trigger (startup, reconnect, timer, button) shares it. */
  private inFlight: Promise<void> | null = null;

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
      if (this._pendingCount() > 0 && this.connectivity.isOnline()) {
        this.flush();
      }
    }, SYNC_INTERVAL_MS);
  }

  async refreshPendingCount(): Promise<number> {
    const ops = await this.queue.getPendingOps();
    const pending = ops.filter(op => !op.failed).length;
    this._pendingCount.set(pending);
    this._failedCount.set(ops.length - pending);
    return pending;
  }

  /** Sends pending operations. Concurrent calls return the run already in progress. */
  flush(): Promise<void> {
    if (!this.inFlight) {
      this.inFlight = this.doFlush().finally(() => this.inFlight = null);
    }
    return this.inFlight;
  }

  /** Puts server-rejected operations back in the queue and tries again. */
  async retryFailed(): Promise<void> {
    await this.queue.retryFailed();
    await this.refreshPendingCount();
    return this.flush();
  }

  private async doFlush(): Promise<void> {
    try {
      const ops = (await this.queue.getPendingOps()).filter(op => !op.failed);

      if (ops.length === 0) {
        this._lastSyncError.set(null); // clear stale error when nothing left to sync
        await this.refreshPendingCount();
        return;
      }

      // If API key missing, try to fetch it now (JWT cookie may still be valid)
      let apiKey = localStorage.getItem(UtilStatic.API_KEY);
      if (!apiKey) {
        apiKey = await this.tryFetchApiKey();
      }
      if (!apiKey) {
        this._lastSyncError.set('Clé API introuvable. Reconnectez-vous pour activer la synchronisation.');
        return;
      }

      this._syncing.set(true);
      this._lastSyncError.set(null);
      const headers = new HttpHeaders({ 'X-Api-Key': apiKey });
      let processedAny = false;
      let rejected = 0;

      try {
        // One batch per caisse session, in chronological order: the server attaches
        // sales to the session open at that point, so sessions must not be mixed.
        for (const group of this.groupBySession(ops)) {
          const result = await lastValueFrom(
            this.http.post<SyncBatchResult>(RequestsConstants.SYNC_BATCH_REQ, this.buildBatchRequest(group), { headers })
          );
          if (!result) break;

          const { processed, failures } = this.resolveResults(group, result);
          await this.queue.deletePendingOps(processed);
          // Rejections are deterministic (unknown product, no open session…): replaying them
          // automatically would block or misattribute later sessions, so they are set aside.
          await this.queue.markFailed(failures);
          processedAny = processedAny || processed.length > 0;
          rejected += failures.length;

          const closeOk = group.some(op => op.type === 'CLOSE_SESSION') && result.closeSessionResult && !result.closeSessionError;
          if (closeOk) {
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
        }
        if (rejected > 0) {
          this._lastSyncError.set(`${rejected} opération(s) refusée(s) par le serveur lors de la synchro.`);
        }
      } catch (err: any) {
        if (err?.status === 0) this.connectivity.markOffline();
        const msg = err?.error?.message ?? err?.message ?? 'Erreur réseau lors de la synchronisation.';
        this._lastSyncError.set(msg);
        console.error('[SyncService] Sync failed:', err);
      } finally {
        this._syncing.set(false);
        await this.refreshPendingCount();
        if (processedAny) {
          // Notify subscribers (e.g. MenuService, CaisseSessionService) to refresh from the server
          this._syncCompleted.next();
        }
      }

    } catch (outerErr) {
      console.error('[SyncService] Erreur inattendue dans flush():', outerErr);
    }
  }

  /** Splits the queue (ordered by insertion) into OPEN … SALE* … CLOSE groups. */
  private groupBySession(ops: PendingOperation[]): PendingOperation[][] {
    const sorted = [...ops].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    const groups: PendingOperation[][] = [];
    let current: PendingOperation[] = [];
    for (const op of sorted) {
      if (op.type === 'OPEN_SESSION' && current.length > 0) {
        groups.push(current);
        current = [];
      }
      current.push(op);
      if (op.type === 'CLOSE_SESSION') {
        groups.push(current);
        current = [];
      }
    }
    if (current.length > 0) groups.push(current);
    return groups;
  }

  private buildBatchRequest(ops: PendingOperation[]): SyncBatchRequest {
    const request: SyncBatchRequest = {};
    const sales: any[] = [];

    for (const op of ops) {
      if (op.type === 'OPEN_SESSION') request.openSession = { localId: op.localId, ...op.payload };
      else if (op.type === 'SALE') sales.push({ localId: op.localId, ...op.payload });
      else if (op.type === 'CLOSE_SESSION') request.closeSession = { localId: op.localId, ...op.payload };
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

  private resolveResults(ops: PendingOperation[], result: SyncBatchResult):
      { processed: number[]; failures: Array<{ op: PendingOperation; error: string }> } {
    const processed: number[] = [];
    const failures: Array<{ op: PendingOperation; error: string }> = [];

    for (const op of ops) {
      if (op.id == null) continue;

      if (op.type === 'OPEN_SESSION') {
        if (result.openSessionResult && !result.openSessionError) processed.push(op.id);
        else failures.push({ op, error: result.openSessionError ?? 'Ouverture de caisse refusée.' });
      } else if (op.type === 'SALE') {
        const saleResult = result.salesResults?.find(r => r.localId === op.localId);
        if (saleResult?.success) processed.push(op.id);
        else failures.push({ op, error: saleResult?.error ?? 'Vente refusée.' });
      } else if (op.type === 'CLOSE_SESSION') {
        if (result.closeSessionResult && !result.closeSessionError) processed.push(op.id);
        else failures.push({ op, error: result.closeSessionError ?? 'Fermeture de caisse refusée.' });
      }
    }

    return { processed, failures };
  }
}
