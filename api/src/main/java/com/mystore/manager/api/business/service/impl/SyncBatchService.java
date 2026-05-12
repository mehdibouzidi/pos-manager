package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.business.payload.CaisseSessionPayload;
import com.mystore.manager.api.business.payload.SalePayload;
import com.mystore.manager.api.business.payload.SaleSyncResultPayload;
import com.mystore.manager.api.business.payload.SyncBatchRequestPayload;
import com.mystore.manager.api.business.payload.SyncBatchResultPayload;
import com.mystore.manager.api.business.service.inter.ICaisseSessionService;
import com.mystore.manager.api.business.service.inter.ISaleService;
import com.mystore.manager.api.business.service.inter.ISyncBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SyncBatchService implements ISyncBatchService {

    private final ISaleService saleService;
    private final ICaisseSessionService caisseSessionService;

    @Autowired
    public SyncBatchService(ISaleService saleService, ICaisseSessionService caisseSessionService) {
        this.saleService = saleService;
        this.caisseSessionService = caisseSessionService;
    }

    @Override
    public SyncBatchResultPayload process(SyncBatchRequestPayload payload) {
        SyncBatchResultPayload result = new SyncBatchResultPayload();

        // 1. Open caisse session if requested
        if (payload.getOpenSession() != null) {
            try {
                result.setOpenSessionResult(caisseSessionService.open(payload.getOpenSession()));
            } catch (Exception e) {
                result.setOpenSessionError(e.getMessage());
            }
        }

        // 2. Process sales — do not abort on individual failure
        List<SaleSyncResultPayload> salesResults = new ArrayList<>();
        if (payload.getSales() != null) {
            for (SalePayload salePayload : payload.getSales()) {
                SaleSyncResultPayload saleResult = new SaleSyncResultPayload();
                saleResult.setLocalId(salePayload.getLocalId());
                try {
                    SalePayload saved = saleService.save(salePayload);
                    saleResult.setOrderNumber(saved.getOrderNumber());
                    saleResult.setSuccess(true);
                } catch (Exception e) {
                    saleResult.setSuccess(false);
                    saleResult.setError(e.getMessage());
                }
                salesResults.add(saleResult);
            }
        }
        result.setSalesResults(salesResults);

        // 3. Close caisse session if requested
        if (payload.getCloseSession() != null) {
            try {
                result.setCloseSessionResult(caisseSessionService.close(payload.getCloseSession()));
            } catch (Exception e) {
                result.setCloseSessionError(e.getMessage());
            }
        }

        return result;
    }
}
