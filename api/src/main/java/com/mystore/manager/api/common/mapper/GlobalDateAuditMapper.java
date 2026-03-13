package com.mystore.manager.api.common.mapper;

import com.mystore.manager.api.common.model.AbstractDateAudit;
import com.mystore.manager.api.common.payload.GlobalDatePayload;
import com.mystore.manager.api.common.util.CommonUtil;

import java.util.Objects;

public class GlobalDateAuditMapper {
    public static <T extends GlobalDatePayload, E extends AbstractDateAudit> E payloadToEntity(T payload, E entity) {
        if(Objects.nonNull(payload.getId())) entity.setId(payload.getId());
        //createdAt and updatedAt are handled by @EnableJpaAuditing
        return entity;
    }

    public static <E extends AbstractDateAudit, T extends GlobalDatePayload> T entityToPayload(E entity, T payload) {
        if(Objects.nonNull(entity.getId())) payload.setId(entity.getId());
        if(Objects.nonNull(entity.getCreatedAt())) payload.setCreatedAt(CommonUtil.instantToDateTime(entity.getCreatedAt()));
        if(Objects.nonNull(entity.getUpdatedAt())) payload.setUpdatedAt(CommonUtil.instantToDateTime(entity.getUpdatedAt()));
        return payload;
    }
}
