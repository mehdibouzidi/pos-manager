package com.mystore.manager.api.admin.service.inter;

import com.mystore.manager.api.admin.criteria.ApiKeyCriteria;
import com.mystore.manager.api.admin.payload.ApiKeyPayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

import java.util.List;

public interface IApiKeyService {
    ApiKeyPayload save(ApiKeyPayload payload);
    ApiKeyPayload edit(ApiKeyPayload payload);
    ApiKeyPayload regenerate(Integer id);
    boolean deleteById(Integer id);
    ApiKeyPayload findById(Integer id);
    ApiKeyPayload findActiveByPosId(Integer posId);
    List<ApiKeyPayload> findAll();
    GlobalPayload<ApiKeyPayload> findByCriteria(ApiKeyCriteria criteria);
}
