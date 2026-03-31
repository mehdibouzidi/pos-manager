package com.mystore.manager.api.business.service.inter;

import com.mystore.manager.api.business.common.criteria.StockMovementCriteria;
import com.mystore.manager.api.business.payload.StockMovementPayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

import java.util.List;

public interface IStockMovementService {
    StockMovementPayload save(StockMovementPayload payload);
    StockMovementPayload update(StockMovementPayload payload);
    boolean deleteById(Integer id);
    StockMovementPayload findById(Integer id);
    List<StockMovementPayload> findAll();
    GlobalPayload<StockMovementPayload> findAllByCriteria(StockMovementCriteria criteria);
}
