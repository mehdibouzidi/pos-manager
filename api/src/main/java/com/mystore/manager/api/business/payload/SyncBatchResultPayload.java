package com.mystore.manager.api.business.payload;

import lombok.Data;

import java.util.List;

@Data
public class SyncBatchResultPayload {
    private CaisseSessionPayload openSessionResult;
    private List<SaleSyncResultPayload> salesResults;
    private CaisseSessionPayload closeSessionResult;
    private String openSessionError;
    private String closeSessionError;
}
