import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AdminConstants } from '../util/AdminConstants';
import { RequestsConstants } from '../util/RequestsConstants';
import { PayloadSanitizer } from '../util/payload-sanitizer';
import { UtilStatic } from '../util/UtilStatic';
import { UserPayload } from '../../payloads/admin/userpayload';
import { ChangePasswordPayload } from '../../payloads/admin/changepasswordpayload';
import { UserCriteria } from '../../criteria/admin/usercriteria';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  API_SOURCE: string;

  constructor(private http: HttpClient) { 
    this.API_SOURCE = environment.api_source;
  }
  
    edit(userPayload: UserPayload) {
      const url = RequestsConstants.USER_UPDATE_REQ;
      const formData = new FormData();
      formData.append('picture', userPayload.picture);

      const sanitizedPayload = PayloadSanitizer.sanitize(userPayload);
      sanitizedPayload.picture = null;

      formData.append(
        'user',
        new Blob(
          [JSON.stringify(sanitizedPayload)],
          {type: "application/json"}
        )
      );

      return this.http.put( url, formData);
    }

    updatePassword(userPasswordPayload: ChangePasswordPayload) {
      const url = `${this.API_SOURCE}${AdminConstants.USER}${UtilStatic.SLASH}${AdminConstants.CHANGE_PASSWORD}`;
      return this.http.put( url, userPasswordPayload);
    }

    disable(payload: UserPayload) {
      const url = RequestsConstants.USER_DISABLE_REQ;
      return this.http.put( url, payload);
    }

  update(payload: UserPayload) {
        return this.http.put( RequestsConstants.USER_UPDATE_REQ, PayloadSanitizer.sanitize(payload));
  }
  
  get(id: number){
    const url = `${this.API_SOURCE}${AdminConstants.USER}${UtilStatic.SLASH}${id}`;
    return this.http.get( url);
  }

  findAllByCriteria(criteria: UserCriteria){
    return this.http.post(RequestsConstants.USER_FINDALL_CRITERIA_REQ, criteria);
  }
}
