import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RequestsConstants } from '../util/RequestsConstants';
import { Observable } from 'rxjs';
import { ProductCategory } from '../../../app/back/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductCategoryService {

  constructor(private http: HttpClient) {}

  findAll(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(RequestsConstants.PRODUCT_CATEGORY_FINDALL_REQ);
  }
}
