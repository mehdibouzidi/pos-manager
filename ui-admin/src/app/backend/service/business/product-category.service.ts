import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductCategoryCriteria } from '../../criteria/business/product-category-criteria';
import { RequestsConstants } from '../util/RequestsConstants';
import { PayloadSanitizer } from '../util/payload-sanitizer';
import { UtilStatic } from '../util/UtilStatic';
import { ProductCategoryPayload } from '../../payloads/business/product-category-payload';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {

  constructor(private http: HttpClient) {}

  findAllByCriteria(criteria: ProductCategoryCriteria) {
    return this.http.post(`${RequestsConstants.PRODUCT_CATEGORY_FINDALL_CRITERIA_REQ}`, criteria);
  }

  findAll() {
    return this.http.get(`${RequestsConstants.PRODUCT_CATEGORY_FINDALL_REQ}`);
  }

  add(payload: ProductCategoryPayload) {
    return this.http.post(RequestsConstants.PRODUCT_CATEGORY_ADD_REQ, PayloadSanitizer.sanitize(payload));
  }

  update(payload: ProductCategoryPayload) {
    return this.http.put(RequestsConstants.PRODUCT_CATEGORY_UPDATE_REQ, PayloadSanitizer.sanitize(payload));
  }

  get(categoryId: number) {
    const url = `${RequestsConstants.PRODUCT_CATEGORY_REQ}${UtilStatic.SLASH}${categoryId}`;
    return this.http.get(url);
  }

  delete(categoryId: number) {
    const url = `${RequestsConstants.PRODUCT_CATEGORY_DELETE_REQ}${UtilStatic.SLASH}${categoryId}`;
    return this.http.delete(url);
  }
}
