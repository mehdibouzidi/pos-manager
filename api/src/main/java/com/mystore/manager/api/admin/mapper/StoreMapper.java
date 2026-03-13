package com.mystore.manager.api.admin.mapper;

import com.mystore.manager.api.admin.model.StoreEntity;
import com.mystore.manager.api.admin.payload.StorePayload;
import com.mystore.manager.api.common.mapper.GlobalAuditMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class StoreMapper implements IMapper<StorePayload, StoreEntity> {

    public StoreEntity payloadToEntity(StorePayload payload, StoreEntity entity) {
        if (Objects.nonNull(payload)) {
            entity = GlobalAuditMapper.payloadToEntity(payload, entity);
            entity.setAddress(payload.getAddress());
            entity.setPhone(payload.getPhone());
            entity.setEmail(payload.getEmail());
            entity.setActive(payload.isActive());
        }
        return entity;
    }

    public StorePayload entityToPayload(StoreEntity entity) {
        StorePayload payload = new StorePayload();
        if (Objects.nonNull(entity)) {
            payload = GlobalAuditMapper.entityToPayload(entity, payload);
            payload.setAddress(entity.getAddress());
            payload.setPhone(entity.getPhone());
            payload.setEmail(entity.getEmail());
            payload.setActive(entity.isActive());
        }
        return payload;
    }
    
    @Override
    public java.util.List<StorePayload> entityListToPayload(java.util.List<StoreEntity> entities, boolean detailed) {
        if (entities == null) return java.util.Collections.emptyList();
        return entities.stream().map(this::entityToPayload).toList();
    }
}
