package com.mystore.manager.api.business.payload;

import com.mystore.manager.api.common.payload.GlobalUserDatePayload;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class SalePayload extends GlobalUserDatePayload {
    private String localId;
    private Integer orderNumber;
    private String saleDate;
    private Double totalAmount;
    private String paymentMethod;
    private List<SaleItemPayload> items;
}
