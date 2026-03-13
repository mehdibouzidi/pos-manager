package com.mystore.manager.api.common.mapper;

import com.mystore.manager.api.common.model.AbstractGlobalConfigurationData;
import com.mystore.manager.api.common.payload.GlobalDataPayload;
import com.mystore.manager.api.common.util.CommonUtil;

import java.util.Objects;

/**
 * Mapper for configuration data entities (no store association).
 * Similar to GlobalAuditMapper but for AbstractGlobalConfigurationData.
 */
public class ConfigurationDataMapper {
    
    public static <T extends GlobalDataPayload, E extends AbstractGlobalConfigurationData> E payloadToEntity(T payload, E entity) {
        if (Objects.nonNull(payload.getId())) entity.setId(payload.getId());
        if (Objects.nonNull(payload.getCode())) entity.setCode(payload.getCode());
        if (Objects.nonNull(payload.getName())) entity.setName(payload.getName());
        // createdAt and updatedAt are handled by @EnableJpaAuditing
        return entity;
    }

    public static <E extends AbstractGlobalConfigurationData, T extends GlobalDataPayload> T entityToPayload(E entity, T payload) {
        if (Objects.nonNull(entity.getId())) payload.setId(entity.getId());
        if (Objects.nonNull(entity.getCode())) payload.setCode(entity.getCode());
        if (Objects.nonNull(entity.getName())) payload.setName(entity.getName());
        if (Objects.nonNull(entity.getCreatedBy())) {
            payload.setCreatedById(entity.getCreatedBy().getId());
            payload.setCreatedByUsername(entity.getCreatedBy().getUsername());
            payload.setCreatedByFullName(CommonUtil.composeFullName(
                    entity.getCreatedBy().getFirstName(),
                    entity.getCreatedBy().getLastName()));
        }
        if (Objects.nonNull(entity.getUpdatedBy())) {
            payload.setUpdatedById(entity.getUpdatedBy().getId());
            payload.setUpdatedByUsername(entity.getUpdatedBy().getUsername());
            payload.setUpdatedByFullName(CommonUtil.composeFullName(
                    entity.getUpdatedBy().getFirstName(),
                    entity.getUpdatedBy().getLastName()));
        }
        if (Objects.nonNull(entity.getCreatedAt())) {
            payload.setCreatedAt(CommonUtil.instantToDateTime(entity.getCreatedAt()));
        }
        if (Objects.nonNull(entity.getUpdatedAt())) {
            payload.setUpdatedAt(CommonUtil.instantToDateTime(entity.getUpdatedAt()));
        }
        // Note: No store mapping for configuration data
        return payload;
    }
}
