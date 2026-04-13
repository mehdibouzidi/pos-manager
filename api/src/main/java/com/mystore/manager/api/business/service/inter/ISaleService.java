package com.mystore.manager.api.business.service.inter;

import com.mystore.manager.api.business.payload.SalePayload;

public interface ISaleService {
    SalePayload save(SalePayload payload);
    SalePayload findById(Integer id);
}
