package com.mystore.manager.api.admin.mapper;

import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.admin.payload.PosPayload;
import com.mystore.manager.api.common.mapper.GlobalAuditMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class PosMapper implements IMapper<PosPayload, PosEntity> {

    public PosEntity payloadToEntity(PosPayload payload, PosEntity entity) {
        if (Objects.nonNull(payload)) {
            entity = GlobalAuditMapper.payloadToEntity(payload, entity);
            entity.setAddress(payload.getAddress());
            entity.setPhone(payload.getPhone());
            entity.setEmail(payload.getEmail());
            entity.setActive(payload.isActive());
        }
        return entity;
    }

    public PosPayload entityToPayload(PosEntity entity) {
        PosPayload payload = new PosPayload();
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
    public java.util.List<PosPayload> entityListToPayload(java.util.List<PosEntity> entities, boolean detailed) {
        if (entities == null) return java.util.Collections.emptyList();
        return entities.stream().map(this::entityToPayload).toList();
    }
}
