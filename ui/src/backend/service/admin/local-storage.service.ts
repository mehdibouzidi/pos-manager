import { Injectable } from '@angular/core';
import { UtilStatic } from '../util/UtilStatic';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  
  private ls = window.localStorage;

  constructor() { }

  public setItem(key: string, value: any): boolean {
    value = JSON.stringify(value);
    this.ls.setItem(key, value);
    return true;
  }

  public getItem(key: string): any {
    let value = this.ls.getItem(key);
    try{
      return JSON.parse(value!);
    }catch (e){
      return null;
    }
  }

  public clear() {
    this.ls.clear();
  }

  /**
   * Removes the login data only. Terminal data needed by offline mode survives a logout / expiry:
   * the offline caisse session, the sync API key, the POS id (menu cache) and the ticket counter.
   */
  public clearAuth() {
    const keep = new Set<string>([
      UtilStatic.API_KEY,
      UtilStatic.OFFLINE_SESSION,
      UtilStatic.POS_ID,
      'pos-offline-order-counter'
    ]);
    Object.keys(this.ls)
      .filter(key => !keep.has(key))
      .forEach(key => this.ls.removeItem(key));
  }
}
