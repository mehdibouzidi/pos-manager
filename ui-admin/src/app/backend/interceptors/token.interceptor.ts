import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { AuthService } from "../service/admin/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class TokenInterceptor implements HttpInterceptor{
    
    constructor(private authService: AuthService, private snackBar: MatSnackBar) { 
    }
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var token = this.authService.getJwt();
        
        if (token && this.isTokenExpired(token)) {
            this.authService.logout(); 
            this.openSnackBar('error', 'Votre session a expiré, veuillez vous reconnecter.');
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
        return true; // En cas d'erreur, on considère le token invalide
        }
    }

    openSnackBar(type: string, message: string) {
      this.snackBar.open(message, 'Fermer', { duration: 5000, panelClass: ['snack-'+type] });
    }
}