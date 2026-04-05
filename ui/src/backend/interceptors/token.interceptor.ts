import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { AuthService } from "../service/admin/auth.service";
import { UtilStatic } from "../service/util/UtilStatic";

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
        return next.handle(req.clone({ withCredentials: true }));
    }
}