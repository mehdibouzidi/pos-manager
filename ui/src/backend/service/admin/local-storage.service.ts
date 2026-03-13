import { Injectable } from '@angular/core';

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
}
