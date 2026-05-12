import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const HEALTH_URL = environment.api_source + 'api/health';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {

  private _isOnline = signal<boolean>(navigator.onLine);
  readonly isOnline = this._isOnline.asReadonly();

  /** Emits each time connectivity is restored AND the backend is reachable */
  private _onlineSubject = new Subject<void>();
  readonly online$ = this._onlineSubject.asObservable();

  constructor(private http: HttpClient) {
    window.addEventListener('online', () => this.ping());
    window.addEventListener('offline', () => this._isOnline.set(false));
    // Check at startup — covers page reload while online with pending ops
    if (navigator.onLine) {
      this.ping();
    }
  }

  /** Ping the backend. If reachable, set online and emit online$. */
  ping(): void {
    this.http.get(HEALTH_URL, { observe: 'response' }).subscribe({
      next: () => {
        const wasOffline = !this._isOnline();
        this._isOnline.set(true);
        if (wasOffline) {
          // Only emit when transitioning offline → online
          this._onlineSubject.next();
        }
      },
      error: () => {
        this._isOnline.set(false);
      }
    });
  }
}
