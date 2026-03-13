package com.mystore.manager.api.admin.service.inter;

import com.mystore.manager.api.admin.criteria.StoreCriteria;
import com.mystore.manager.api.admin.payload.StorePayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

import java.util.List;

public interface IStoreService {
    StorePayload save(StorePayload storePayload);
    StorePayload edit(StorePayload storePayload);
    boolean deleteById(Integer id);
    List<StorePayload> findAll();
    StorePayload findById(Integer id);
    StorePayload findByCode(String code);
    GlobalPayload<StorePayload> findByCriteria(StoreCriteria criteria);
}
