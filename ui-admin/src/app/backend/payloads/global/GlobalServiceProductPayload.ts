import { GlobalUserDatePayload } from "./GlobalUserDatePayload";

export class GlobalServiceProductPayload extends GlobalUserDatePayload {
  serviceProduct: any;
  quantity: number;

  constructor(
    serviceProduct: any | null = null,
    quantity: number = 0
  ) {
    super();
    this.serviceProduct = serviceProduct || {};
    this.quantity = quantity;
  }
}
