import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestsConstants } from '../util/RequestsConstants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  /** period: DAY, WEEK, MONTH, YEAR, ALL or CUSTOM (then fromDate/toDate, yyyy-MM-dd, inclusive). */
  getStats(period: string, fromDate?: string | null, toDate?: string | null): Observable<any> {
    let params = new HttpParams().set('period', period);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<any>(RequestsConstants.DASHBOARD_STATS_REQ, { params });
  }
}
