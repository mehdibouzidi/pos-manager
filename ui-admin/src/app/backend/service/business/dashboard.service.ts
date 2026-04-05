import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestsConstants } from '../util/RequestsConstants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  getStats(period: string): Observable<any> {
    return this.http.get<any>(`${RequestsConstants.DASHBOARD_STATS_REQ}?period=${period}`);
  }
}
