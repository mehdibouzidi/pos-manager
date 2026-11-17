package com.mystore.manager.api.business.service.inter;

import com.mystore.manager.api.business.common.criteria.SaleCriteria;
import com.mystore.manager.api.business.payload.SalePayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

public interface ISaleService {
    SalePayload save(SalePayload payload);
    SalePayload findById(Integer id);
    GlobalPayload<SalePayload> findAllByCriteria(SaleCriteria criteria);
}
