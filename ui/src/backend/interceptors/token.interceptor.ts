import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { AuthService } from "../service/admin/auth.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor{
    
    constructor(private authService: AuthService) { 
    }
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var token = this.authService.getJwt();
        
        if (token && this.isTokenExpired(token)) {
            this.authService.logout(); 
            console.warn('Session expirée, veuillez vous reconnecter.');
            return throwError(() => new Error('Token expired'));
        }

        var changedReq;
        var needBearer = this.authService.checkIfNeedBearer(req);
        
        if(needBearer){
            if(!token) {
                token = ' ';
            }
            changedReq = req.clone({
                setHeaders: {
                    Authorization:  `Bearer ${token}`
                } 
             });
        }else{
            changedReq = req;
        }

        return next.handle(changedReq);
    }

    isTokenExpired(token: string): boolean {
        try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp && payload.exp < now;
        } catch {
        return true;
        }
    }
}