package com.mystore.manager.api.admin.service.inter;

import com.mystore.manager.api.admin.criteria.PosCriteria;
import com.mystore.manager.api.admin.payload.PosPayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

import java.util.List;

public interface IPosService {
    PosPayload save(PosPayload posPayload);
    PosPayload edit(PosPayload posPayload);
    boolean deleteById(Integer id);
    List<PosPayload> findAll();
    PosPayload findById(Integer id);
    PosPayload findByCode(String code);
    GlobalPayload<PosPayload> findByCriteria(PosCriteria criteria);
}
