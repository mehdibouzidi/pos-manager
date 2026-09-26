import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { SyncService } from './sync.service';
import { ConnectivityService } from './connectivity.service';
import { PendingQueueService } from './pending-queue.service';
import { OfflineStorageService, PendingOperation } from './offline-storage.service';
import { RequestsConstants } from '../util/RequestsConstants';
import { UtilStatic } from '../util/UtilStatic';

const tick = () => new Promise(resolve => setTimeout(resolve));

describe('SyncService', () => {
  let service: SyncService;
  let http: HttpTestingController;
  let ops: PendingOperation[];
  let queue: jasmine.SpyObj<PendingQueueService>;

  const op = (id: number, type: PendingOperation['type'], localId: string): PendingOperation =>
    ({ id, type, localId, payload: { localId }, timestamp: new Date(2026, 0, 1, 0, 0, id).toISOString() });

  beforeEach(() => {
    ops = [];
    queue = jasmine.createSpyObj<PendingQueueService>('PendingQueueService',
      ['getPendingOps', 'deletePendingOps', 'markFailed', 'retryFailed', 'seedOrderCounter', 'resetOrderCounter']);
    queue.getPendingOps.and.callFake(async () => ops);
    queue.deletePendingOps.and.callFake(async (ids: number[]) => { ops = ops.filter(o => !ids.includes(o.id!)); });
    queue.markFailed.and.callFake(async failures => {
      failures.forEach(f => { const o = ops.find(x => x.id === f.op.id)!; o.failed = true; o.error = f.error; });
    });
    localStorage.setItem(UtilStatic.API_KEY, 'test-key');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PendingQueueService, useValue: queue },
        { provide: OfflineStorageService, useValue: {} },
        { provide: ConnectivityService, useValue: { online$: new Subject<void>(), isOnline: () => false, markOffline: () => {} } },
      ]
    });
    service = TestBed.inject(SyncService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem(UtilStatic.API_KEY);
  });

  it('sends one batch per offline session, in order, and removes processed operations', async () => {
    ops = [
      op(1, 'OPEN_SESSION', 'o1'), op(2, 'SALE', 's1'), op(3, 'SALE', 's2'), op(4, 'CLOSE_SESSION', 'c1'),
      op(5, 'OPEN_SESSION', 'o2'), op(6, 'SALE', 's3'), op(7, 'CLOSE_SESSION', 'c2'),
    ];
    const done = service.flush();
    await tick();

    const first = http.expectOne(RequestsConstants.SYNC_BATCH_REQ);
    expect(first.request.body.openSession.localId).toBe('o1');
    expect(first.request.body.sales.map((s: any) => s.localId)).toEqual(['s1', 's2']);
    expect(first.request.body.closeSession.localId).toBe('c1');
    first.flush({
      openSessionResult: { id: 1 }, closeSessionResult: { id: 1 },
      salesResults: [{ localId: 's1', success: true, orderNumber: 1 }, { localId: 's2', success: true, orderNumber: 2 }]
    });
    await tick();

    const second = http.expectOne(RequestsConstants.SYNC_BATCH_REQ);
    expect(second.request.body.openSession.localId).toBe('o2');
    expect(second.request.body.sales.map((s: any) => s.localId)).toEqual(['s3']);
    expect(second.request.body.closeSession.localId).toBe('c2');
    second.flush({
      openSessionResult: { id: 2 }, closeSessionResult: { id: 2 },
      salesResults: [{ localId: 's3', success: true, orderNumber: 3 }]
    });
    await done;

    expect(ops).toEqual([]);
  });

  it('shares a single run between concurrent flush() calls', async () => {
    ops = [op(1, 'SALE', 's1')];
    const a = service.flush();
    const b = service.flush();
    expect(a).toBe(b);
    await tick();

    http.expectOne(RequestsConstants.SYNC_BATCH_REQ)
      .flush({ salesResults: [{ localId: 's1', success: true, orderNumber: 1 }] });
    await a;
    expect(ops).toEqual([]);
  });

  it('keeps operations when the response is lost, and replays them with the same localId', async () => {
    ops = [op(1, 'SALE', 's1')];
    const run = service.flush();
    await tick();
    http.expectOne(RequestsConstants.SYNC_BATCH_REQ).error(new ProgressEvent('error'), { status: 0 });
    await run;
    expect(ops.length).toBe(1);

    const retry = service.flush();
    await tick();
    const req = http.expectOne(RequestsConstants.SYNC_BATCH_REQ);
    expect(req.request.body.sales[0].localId).toBe('s1');
    req.flush({ salesResults: [{ localId: 's1', success: true, orderNumber: 1 }] });
    await retry;
    expect(ops).toEqual([]);
  });

  it('sets server-rejected operations aside instead of resending them forever', async () => {
    ops = [op(1, 'SALE', 's1'), op(2, 'SALE', 's2')];
    const run = service.flush();
    await tick();
    http.expectOne(RequestsConstants.SYNC_BATCH_REQ).flush({
      salesResults: [
        { localId: 's1', success: true, orderNumber: 1 },
        { localId: 's2', success: false, error: 'Produit introuvable (id 9).' }
      ]
    });
    await run;

    expect(ops.length).toBe(1);
    expect(ops[0].failed).toBeTrue();
    expect(service.failedCount()).toBe(1);
    expect(service.pendingCount()).toBe(0);

    // Nothing left to send automatically
    await service.flush();
    http.expectNone(RequestsConstants.SYNC_BATCH_REQ);
  });
});
