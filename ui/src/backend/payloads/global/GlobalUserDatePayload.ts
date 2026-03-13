import { GlobalDatePayload } from './GlobalDatePayload';

export class GlobalUserDatePayload extends GlobalDatePayload {
  createdById: number | null;
  createdByUsername: string | null;
  createdByFullName: string | null;
  updatedById: number | null;
  updatedByUsername: string | null;
  updatedByFullName: string | null;

  constructor() {
    super();
    this.createdById = null;
    this.createdByUsername = null;
    this.createdByFullName = null;
    this.updatedById = null;
    this.updatedByUsername = null;
    this.updatedByFullName = null;
  }
}
