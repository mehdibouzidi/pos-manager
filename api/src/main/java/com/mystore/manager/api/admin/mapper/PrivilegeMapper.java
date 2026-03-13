package com.mystore.manager.api.admin.mapper;

import com.mystore.manager.api.admin.model.PrivilegeEntity;
import com.mystore.manager.api.admin.payload.PrivilegePayload;
import com.mystore.manager.api.common.mapper.GlobalAuditMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class PrivilegeMapper implements IMapper<PrivilegePayload, PrivilegeEntity> {


    public PrivilegeEntity payloadToEntity(PrivilegePayload payload){
        PrivilegeEntity entity = new PrivilegeEntity();
        entity = GlobalAuditMapper.payloadToEntity(payload, entity);
        return entity;
    }

    public PrivilegePayload entityToPayload(PrivilegeEntity entity){
        PrivilegePayload payload = new PrivilegePayload();
        if (Objects.nonNull(entity)) {
            payload = GlobalAuditMapper.entityToPayload(entity, payload);
        }
        return payload;
    }
    @Override
    public List<PrivilegePayload> entityListToPayload(List<PrivilegeEntity> entities, boolean detailed) {
        return Objects.isNull(entities) ? null : entities.stream().map(this::entityToPayload).toList();
    }
}
