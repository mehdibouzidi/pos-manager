import { GlobalUserDatePayload } from "./GlobalUserDatePayload";
import { ProductPayload } from '../business/productpayload';

export class GlobalProductPayload extends GlobalUserDatePayload {
  product: ProductPayload;
  quantity: number;

  constructor(
    product: ProductPayload | null = null,
    quantity: number = 0
  ) {
    super();
    this.product = product || new ProductPayload();
    this.quantity = quantity;
  }
}
