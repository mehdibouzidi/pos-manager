import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PrivilegeCriteria } from '../../criteria/admin/privilegecriteria';
import { RequestsConstants } from '../util/RequestsConstants';
import { PayloadSanitizer } from '../util/payload-sanitizer';
import { UtilStatic } from '../util/UtilStatic';
import { PrivilegePayload } from '../../payloads/admin/privilegepayload';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {

  constructor(private http: HttpClient) { 
    }
  
    findAllByCriteria(criteria: PrivilegeCriteria){
      return this.http.post( `${RequestsConstants.PRIVILEGE_FINDALL_CRITERIA_REQ}`, criteria);
    }
    
    findAll(){
      return this.http.get( `${RequestsConstants.PRIVILEGE_FINDALL_REQ}`);
    }
  
    add(payload: PrivilegePayload){
      return this.http.post( RequestsConstants.PRIVILEGE_ADD_REQ, PayloadSanitizer.sanitize(payload));
    }
  
    update(payload: PrivilegePayload) {
      return this.http.put( RequestsConstants.PRIVILEGE_UPDATE_REQ, PayloadSanitizer.sanitize(payload));
    }
  
    get(id: number){
      const url = `${RequestsConstants.PRIVILEGE_REQ}${UtilStatic.SLASH}${id}`;
      return this.http.get(url);
    }
  
    delete(id: number){
      const url = `${RequestsConstants.PRIVILEGE_DELETE_REQ}${UtilStatic.SLASH}${id}`;
      return this.http.delete( url);
    }
}
