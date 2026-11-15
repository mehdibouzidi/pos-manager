import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { AuthService } from "../service/admin/auth.service";
import { UtilStatic } from "../service/util/UtilStatic";
import { RequestsConstants } from "../service/util/RequestsConstants";

@Injectable()
export class TokenInterceptor implements HttpInterceptor{

    constructor(private authService: AuthService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const needsAuth = this.authService.checkIfNeedBearer(req);

        if (needsAuth) {
            const expStr = localStorage.getItem(UtilStatic.SESSION_EXP);
            if (!expStr || Date.now() > parseInt(expStr, 10)) {
                this.authService.logout();
                console.warn('Session expirée, veuillez vous reconnecter.');
                return throwError(() => new Error('Session expired'));
            }
        }

        // withCredentials ensures the httpOnly JWT cookie is sent with every request
        return next.handle(req.clone({ withCredentials: true })).pipe(
            catchError((err) => {
                // The server no longer accepts the JWT cookie (expired, cleared by the browser…)
                // while the UI still believes it is logged in: send the user back to login instead
                // of failing every call. Offline queue (IndexedDB) and API key survive the logout.
                if (err instanceof HttpErrorResponse && err.status === 401 && this.isSessionBound(req)) {
                    console.warn('Session refusée par le serveur, veuillez vous reconnecter.');
                    this.authService.logout();
                }
                return throwError(() => err);
            })
        );
    }

    /** Requests authenticated by the JWT cookie (not login itself, not API-key sync calls). */
    private isSessionBound(req: HttpRequest<any>): boolean {
        if (!req.url.startsWith(RequestsConstants.API_SOURCE)) return false;
        if (req.headers.has('X-Api-Key')) return false;
        return req.url !== RequestsConstants.LOGIN_REQ
            && req.url !== RequestsConstants.LOGOUT_REQ
            && req.url !== RequestsConstants.PUBLIC_KEY_REQ;
    }
}
