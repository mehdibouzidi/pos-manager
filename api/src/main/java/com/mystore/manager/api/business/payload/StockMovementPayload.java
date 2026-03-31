package com.mystore.manager.api.business.payload;

import com.mystore.manager.api.common.payload.GlobalUserDatePayload;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class StockMovementPayload extends GlobalUserDatePayload {
    private Integer productId;
    private String productCode;
    private String productName;
    private String movementType;
    private Double quantity;
    private String reason;
    private String movementDate;
}
