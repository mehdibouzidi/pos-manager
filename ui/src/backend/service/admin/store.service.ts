import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StoreCriteria } from '../../criteria/admin/storecriteria';
import { RequestsConstants } from '../util/RequestsConstants';
import { PayloadSanitizer } from '../util/payload-sanitizer';
import { StorePayload } from '../../payloads/admin/storepayload';
import { UtilStatic } from '../util/UtilStatic';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

    constructor(private http: HttpClient) { 
    }
    
    findAllByCriteria(criteria: StoreCriteria) {
        return this.http.post(`${RequestsConstants.STORE_FINDALL_CRITERIA_REQ}`, criteria);
    }
      
    findAll() {
        return this.http.get(`${RequestsConstants.STORE_FINDALL_REQ}`);
    }
    
    add(payload: StorePayload) {
        return this.http.post(RequestsConstants.STORE_ADD_REQ, PayloadSanitizer.sanitize(payload));
    }
    
    update(payload: StorePayload) {
        return this.http.put(RequestsConstants.STORE_UPDATE_REQ, PayloadSanitizer.sanitize(payload));
    }
    
    get(id: number) {
        const url = `${RequestsConstants.STORE_REQ}${UtilStatic.SLASH}${id}`;
        return this.http.get(url);
    }
    
    delete(id: number) {
        const url = `${RequestsConstants.STORE_DELETE_REQ}${UtilStatic.SLASH}${id}`;
        return this.http.delete(url);
    }
}
