import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RequestsConstants } from '../util/RequestsConstants';
import { RequestsLists } from '../util/RequestsLists';
import { UtilStatic } from '../util/UtilStatic';
import { PayloadSanitizer } from '../util/payload-sanitizer';
import { LocalStorageService } from './local-storage.service';
import { LoginPayload } from '../../payloads/admin/loginpayload';
import { GlobalUserDatePayload } from '../../payloads/global/GlobalUserDatePayload';
import { UserPayload } from '../../payloads/admin/userpayload';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { AdminConstants } from '../util/AdminConstants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public token: string | null = null;
  public isLoggedIn: boolean = false;

  constructor(
    private ls: LocalStorageService,
    private http: HttpClient,
    private userService: UserService,
    private router: Router) { 
  }

  login(loginPayload: LoginPayload){
    return this.http.post( RequestsConstants.LOGIN_REQ, loginPayload);
  }

  signin(signinPayload: UserPayload){
    const formData = new FormData();
    formData.append('picture', signinPayload.picture);

    const sanitizedPayload = PayloadSanitizer.sanitize(signinPayload);
    sanitizedPayload.picture = null;

    formData.append(
      'user',
      new Blob(
        [JSON.stringify(sanitizedPayload)],
        {type: "application/json"}
      )
    );
    return this.http.post( RequestsConstants.SIGNIN_REQ, formData);
  }
  
  logout(){
    this.ls.clear();
    this.router.navigate([UtilStatic.SLASH + AdminConstants.LOGIN]);
  }
  
  setJwt(token: string){
    this.token = token;
    this.ls.setItem(UtilStatic.TOKEN, token);
  }

  setUsername(username: string){
    this.ls.setItem(UtilStatic.USERNAME, username);
  }

  getJwt(){
    return localStorage.getItem(UtilStatic.TOKEN);
  }
  
  getUsername(){
    return localStorage.getItem(UtilStatic.USERNAME);
  }

  /*checkIfNeedBearer (req: HttpRequest<any>){
    return RequestsLists.REQ_WITH_BEARER.some( requestItem => requestItem.method == req.method && req.url.includes(requestItem.url))
  }*/
    
    checkIfNeedBearer(req: HttpRequest<any>) {
      try {
        const url = new URL(req.url, RequestsConstants.API_SOURCE); // pour supporter les URLs relatives ou absolues
        const normalizedUrl = `${url.origin}${url.pathname}`;
        const originWithTrailingSlash = `${url.origin}${UtilStatic.SLASH}`;

        return RequestsLists.REQ_WITH_BEARER.some(requestItem => {
          if (requestItem.method !== req.method) {
            return false;
          }

          if (requestItem.url.endsWith(UtilStatic.SLASH)) {
            return normalizedUrl.startsWith(requestItem.url);
          }

          if (normalizedUrl === requestItem.url) {
            return true;
          }

          const lastSlashIndex = normalizedUrl.lastIndexOf(UtilStatic.SLASH);
          if (lastSlashIndex <= originWithTrailingSlash.length) {
            return false;
          }

          const trimmedUrl = normalizedUrl.substring(0, lastSlashIndex);
          return trimmedUrl === requestItem.url;
        });
      } catch (error) {
        console.error('URL parsing failed for:', req.url, error);
        return false;
      }
    }
    

  checkIsLoggedIn(): boolean {
    const token = localStorage.getItem(UtilStatic.TOKEN);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        this.ls.clear();
        return false;
      }
      return true;
    } catch {
      this.ls.clear();
      return false;
    }
  }
  
  hasRoles(requestedPrivileges: Array<string>) {
      let userPrivilegesString = this.ls.getItem(UtilStatic.PRIVILEGES); // Retrieve privileges from local storage
    
      // Check if userPrivilegesString is null or undefined
      if (!userPrivilegesString) {
        console.warn('No privileges found in localStorage.');
        return false; // Return false if privileges are not set
      }
    
      // Convert the string to an array (assuming it's already a valid array-like string)
      let userPrivileges: Array<string> = userPrivilegesString as unknown as Array<string>;
    
      // Check if any of the requested privileges exist in the user's privileges
      return requestedPrivileges.some(privilege => userPrivileges.includes(privilege));
    }

}
