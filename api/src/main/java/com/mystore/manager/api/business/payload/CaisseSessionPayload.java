package com.mystore.manager.api.business.payload;

import com.mystore.manager.api.common.payload.GlobalUserDatePayload;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CaisseSessionPayload extends GlobalUserDatePayload {
    private String openedAt;
    private String closedAt;
    private Double openingBalance;
    private Double closingBalance;
    private Double totalSalesAmount;
    private Integer totalSalesCount;
    private Integer firstOrderNumber;
    private Integer lastOrderNumber;
    private Double variance;
    private String status;
    private String notes;
}
