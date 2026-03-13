package com.mystore.manager.api.admin.service.inter;

import com.mystore.manager.api.admin.criteria.PrivilegeCriteria;
import com.mystore.manager.api.admin.model.PrivilegeEntity;
import com.mystore.manager.api.admin.payload.PrivilegePayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

import java.util.List;

public interface IPrivilegeService {

    PrivilegePayload save(PrivilegePayload payload);
    boolean delete(PrivilegePayload payload);
    boolean deleteById(Integer id);
    GlobalPayload<PrivilegePayload> findAllByCriteria(PrivilegeCriteria criteria);
    PrivilegePayload findById(Integer id);
    PrivilegeEntity findByCode(String code);
    PrivilegeEntity getEntity(Integer id);
    PrivilegePayload update(PrivilegePayload payload);

    List<PrivilegePayload> findAll();


}
