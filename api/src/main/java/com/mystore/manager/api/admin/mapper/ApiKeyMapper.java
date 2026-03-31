package com.mystore.manager.api.admin.mapper;

import com.mystore.manager.api.admin.model.ApiKeyEntity;
import com.mystore.manager.api.admin.payload.ApiKeyPayload;
import com.mystore.manager.api.common.mapper.IMapper;
import com.mystore.manager.api.common.util.CommonUtil;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class ApiKeyMapper implements IMapper<ApiKeyPayload, ApiKeyEntity> {

    public ApiKeyEntity payloadToEntity(ApiKeyPayload payload, ApiKeyEntity entity) {
        if (Objects.nonNull(payload.getId())) entity.setId(payload.getId());
        if (Objects.nonNull(payload.getDescription())) entity.setDescription(payload.getDescription());
        entity.setActive(payload.isActive());
        return entity;
    }

    public ApiKeyPayload entityToPayload(ApiKeyEntity entity) {
        ApiKeyPayload payload = new ApiKeyPayload();
        if (Objects.nonNull(entity)) {
            payload.setId(entity.getId());
            payload.setKeyValue(entity.getKeyValue());
            payload.setDescription(entity.getDescription());
            payload.setActive(entity.isActive());
            if (Objects.nonNull(entity.getCreatedAt())) payload.setCreatedAt(CommonUtil.instantToDateTime(entity.getCreatedAt()));
            if (Objects.nonNull(entity.getUpdatedAt())) payload.setUpdatedAt(CommonUtil.instantToDateTime(entity.getUpdatedAt()));
            if (Objects.nonNull(entity.getCreatedBy())) {
                payload.setCreatedById(entity.getCreatedBy().getId());
                payload.setCreatedByUsername(entity.getCreatedBy().getUsername());
                payload.setCreatedByFullName(CommonUtil.composeFullName(entity.getCreatedBy().getFirstName(), entity.getCreatedBy().getLastName()));
            }
            if (Objects.nonNull(entity.getUpdatedBy())) {
                payload.setUpdatedById(entity.getUpdatedBy().getId());
                payload.setUpdatedByUsername(entity.getUpdatedBy().getUsername());
                payload.setUpdatedByFullName(CommonUtil.composeFullName(entity.getUpdatedBy().getFirstName(), entity.getUpdatedBy().getLastName()));
            }
            if (Objects.nonNull(entity.getPos())) {
                payload.setPosId(entity.getPos().getId());
                payload.setPosCode(entity.getPos().getCode());
                payload.setPosName(entity.getPos().getName());
            }
        }
        return payload;
    }

    @Override
    public List<ApiKeyPayload> entityListToPayload(List<ApiKeyEntity> entities, boolean detailed) {
        if (entities == null) return List.of();
        return entities.stream().map(this::entityToPayload).toList();
    }
}
