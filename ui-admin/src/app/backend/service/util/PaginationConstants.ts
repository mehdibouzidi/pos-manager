export class PaginationConstants {
  // INDEXES
  static readonly PURCHASE_INDEX_NAME = 'pagination-purchase-index';
  static readonly SALE_INDEX_NAME = 'pagination-sale-index';
  static readonly CUSTOMER_MOVEMENT_INDEX_NAME = 'pagination-customer-movement-index';

  static getIndexes(){
    return [
      PaginationConstants.PURCHASE_INDEX_NAME,
      PaginationConstants.SALE_INDEX_NAME,
      PaginationConstants.CUSTOMER_MOVEMENT_INDEX_NAME
    ];
  }
  // PAGE SIZE
  static readonly PURCHASE_SIZE_NAME = 'pagination-purchase-size';
  static readonly SALE_SIZE_NAME = 'pagination-sale-size';
  static readonly CUSTOMER_MOVEMENT_SIZE_NAME = 'pagination-customer-movement-size';

  static getSizes(){
    return [
      PaginationConstants.PURCHASE_SIZE_NAME,
      PaginationConstants.SALE_SIZE_NAME,
      PaginationConstants.CUSTOMER_MOVEMENT_SIZE_NAME
    ];
  }
}
