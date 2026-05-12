package com.mystore.manager.api.business.service.inter;

import com.mystore.manager.api.business.payload.SyncBatchRequestPayload;
import com.mystore.manager.api.business.payload.SyncBatchResultPayload;

public interface ISyncBatchService {
    SyncBatchResultPayload process(SyncBatchRequestPayload payload);
}
