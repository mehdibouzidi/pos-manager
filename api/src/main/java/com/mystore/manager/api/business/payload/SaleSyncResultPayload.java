package com.mystore.manager.api.business.payload;

import lombok.Data;

@Data
public class SaleSyncResultPayload {
    private String localId;
    private Integer orderNumber;
    private boolean success;
    private String error;
}
