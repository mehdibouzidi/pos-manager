package com.mystore.manager.api.business.payload;

import lombok.Data;

@Data
public class SaleItemPayload {
    private Integer productId;
    private String productCode;
    private String productName;
    private Double quantity;
    private Double unitPrice;
    private Double totalPrice;
}
