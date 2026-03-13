import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProfilCriteria } from '../../criteria/admin/profilcriteria';
import { RequestsConstants } from '../util/RequestsConstants';
import { PayloadSanitizer } from '../util/payload-sanitizer';
import { ProfilPayload } from '../../payloads/admin/profilpayload';
import { UtilStatic } from '../util/UtilStatic';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {

    constructor(private http: HttpClient) { 
      }
    
      findAllByCriteria(criteria: ProfilCriteria){
        return this.http.post( `${RequestsConstants.PROFIL_FINDALL_CRITERIA_REQ}`, criteria);
      }
      
      findAll(){
        return this.http.get( `${RequestsConstants.PROFIL_FINDALL_REQ}`);
      }
    
      add(payload: ProfilPayload){
        return this.http.post( RequestsConstants.PROFIL_ADD_REQ, PayloadSanitizer.sanitize(payload));
      }
    
      update(payload: ProfilPayload) {
        return this.http.put( RequestsConstants.PROFIL_UPDATE_REQ, PayloadSanitizer.sanitize(payload));
      }
    
      get(id: number){
        const url = `${RequestsConstants.PROFIL_REQ}${UtilStatic.SLASH}${id}`;
        return this.http.get(url);
      }
    
      delete(id: number){
        const url = `${RequestsConstants.PROFIL_DELETE_REQ}${UtilStatic.SLASH}${id}`;
        return this.http.delete( url);
      }
}
