package com.mystore.manager.api.business.payload;

import lombok.Data;

import java.util.List;

@Data
public class SyncBatchRequestPayload {
    private CaisseSessionPayload openSession;
    private List<SalePayload> sales;
    private CaisseSessionPayload closeSession;
}
