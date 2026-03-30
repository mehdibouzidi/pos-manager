import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PosCriteria } from '../../criteria/admin/poscriteria';
import { RequestsConstants } from '../util/RequestsConstants';
import { PayloadSanitizer } from '../util/payload-sanitizer';
import { PosPayload } from '../../payloads/admin/pospayload';
import { UtilStatic } from '../util/UtilStatic';

@Injectable({
  providedIn: 'root'
})
export class PosService {

    constructor(private http: HttpClient) {
    }

    findAllByCriteria(criteria: PosCriteria) {
        return this.http.post(`${RequestsConstants.POS_FINDALL_CRITERIA_REQ}`, criteria);
    }

    findAll() {
        return this.http.get(`${RequestsConstants.POS_FINDALL_REQ}`);
    }

    add(payload: PosPayload) {
        return this.http.post(RequestsConstants.POS_ADD_REQ, PayloadSanitizer.sanitize(payload));
    }

    update(payload: PosPayload) {
        return this.http.put(RequestsConstants.POS_UPDATE_REQ, PayloadSanitizer.sanitize(payload));
    }

    get(id: number) {
        const url = `${RequestsConstants.POS_REQ}${UtilStatic.SLASH}${id}`;
        return this.http.get(url);
    }

    delete(id: number) {
        const url = `${RequestsConstants.POS_DELETE_REQ}${UtilStatic.SLASH}${id}`;
        return this.http.delete(url);
    }
}
