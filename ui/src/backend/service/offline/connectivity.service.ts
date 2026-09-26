import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const HEALTH_URL = environment.api_source + 'api/health';
const PING_INTERVAL_MS = 15_000;

@Injectable({ providedIn: 'root' })
export class ConnectivityService {

  private _isOnline = signal<boolean>(navigator.onLine);
  readonly isOnline = this._isOnline.asReadonly();

  /** Emits each time connectivity is restored AND the backend is reachable */
  private _onlineSubject = new Subject<void>();
  readonly online$ = this._onlineSubject.asObservable();

  private pinging = false;

  constructor(private http: HttpClient) {
    window.addEventListener('online', () => this.ping());
    window.addEventListener('offline', () => this._isOnline.set(false));
    // Check at startup — covers page reload while online with pending ops
    if (navigator.onLine) {
      this.ping();
    }
    // Periodic check: the backend can go down (or come back) while the network interface stays up,
    // in which case the browser never fires 'online' / 'offline'.
    setInterval(() => {
      if (navigator.onLine) this.ping();
    }, PING_INTERVAL_MS);
  }

  /** Ping the backend. If reachable, set online and emit online$. */
  ping(): void {
    if (this.pinging) return;
    this.pinging = true;
    this.http.get(HEALTH_URL, { observe: 'response' }).subscribe({
      next: () => {
        this.pinging = false;
        const wasOffline = !this._isOnline();
        this._isOnline.set(true);
        if (wasOffline) {
          // Only emit when transitioning offline → online
          this._onlineSubject.next();
        }
      },
      error: () => {
        this.pinging = false;
        this._isOnline.set(false);
      }
    });
  }

  /** Called when a request fails at network level: switch to offline mode until the next successful ping. */
  markOffline(): void {
    this._isOnline.set(false);
  }
}
