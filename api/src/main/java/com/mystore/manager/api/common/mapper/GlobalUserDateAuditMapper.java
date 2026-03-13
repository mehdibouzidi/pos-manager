package com.mystore.manager.api.common.mapper;

import com.mystore.manager.api.admin.model.StoreEntity;
import com.mystore.manager.api.admin.repository.StoreRepository;
import com.mystore.manager.api.common.context.StoreContext;
import com.mystore.manager.api.common.model.AbstractBusinessAudit;
import com.mystore.manager.api.common.model.AbstractUserDateAudit;
import com.mystore.manager.api.common.payload.GlobalUserDatePayload;
import com.mystore.manager.api.common.util.CommonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Mapper for entities that extend AbstractUserDateAudit or AbstractBusinessAudit.
 * - For business entities (AbstractBusinessAudit): use payloadToEntity/entityToPayload
 * - For admin entities (AbstractUserDateAudit without store): use payloadToEntityAdmin/entityToPayloadAdmin
 * 
 * Business entities get the store automatically assigned from the JWT context.
 */
@Component
public class GlobalUserDateAuditMapper {
    
    private static StoreRepository storeRepository;
    
    @Autowired
    public void setStoreRepository(StoreRepository storeRepository) {
        GlobalUserDateAuditMapper.storeRepository = storeRepository;
    }
    
    // ================== BUSINESS ENTITIES (with store) ==================
    
    /**
     * Map payload to business entity (with automatic store assignment from JWT context).
     * For updates, if the entity already has a store, it will be preserved.
     */
    public static <T extends GlobalUserDatePayload, E extends AbstractBusinessAudit> E payloadToEntity(T payload, E entity) {
        if(Objects.nonNull(payload.getId())) entity.setId(payload.getId());
        
        // Automatically assign store from JWT context if not already set
        // For updates, the existing entity should already have a store
        if (entity.getStore() == null) {
            Integer storeId = StoreContext.getStoreId();
            if (storeId != null && storeRepository != null) {
                StoreEntity store = storeRepository.getReferenceById(storeId);
                entity.setStore(store);
            }
        }
        
        //createdAt and updatedAt are handled by @EnableJpaAuditing
        return entity;
    }

    /**
     * Map business entity to payload (with store mapping)
     */
    public static <E extends AbstractBusinessAudit, T extends GlobalUserDatePayload> T entityToPayload(E entity, T payload) {
        // Map base audit fields
        mapBaseAuditFields(entity, payload);
        
        // Map store fields (specific to business entities)
        if(Objects.nonNull(entity.getStore())) {
            payload.setStoreId(entity.getStore().getId());
            payload.setStoreCode(entity.getStore().getCode());
            payload.setStoreName(entity.getStore().getName());
        }
        return payload;
    }

    // ================== ADMIN ENTITIES (without store) ==================

    /**
     * Map payload to admin entity (without store)
     */
    public static <T extends GlobalUserDatePayload, E extends AbstractUserDateAudit> E payloadToEntityAdmin(T payload, E entity) {
        if(Objects.nonNull(payload.getId())) entity.setId(payload.getId());
        //createdAt and updatedAt are handled by @EnableJpaAuditing
        return entity;
    }

    /**
     * Map admin entity to payload (without store)
     */
    public static <E extends AbstractUserDateAudit, T extends GlobalUserDatePayload> T entityToPayloadAdmin(E entity, T payload) {
        mapBaseAuditFields(entity, payload);
        return payload;
    }
    
    /**
     * Helper method to map common audit fields
     */
    private static <E extends AbstractUserDateAudit, T extends GlobalUserDatePayload> void mapBaseAuditFields(E entity, T payload) {
        if(Objects.nonNull(entity.getId())) payload.setId(entity.getId());
        if(Objects.nonNull(entity.getCreatedBy())) {
            payload.setCreatedById(entity.getCreatedBy().getId());
            payload.setCreatedByUsername(entity.getCreatedBy().getUsername());
            payload.setCreatedByFullName(CommonUtil.composeFullName(entity.getCreatedBy().getFirstName(),
                    entity.getCreatedBy().getLastName()));
        }
        if(Objects.nonNull(entity.getUpdatedBy())) {
            payload.setUpdatedById(entity.getUpdatedBy().getId());
            payload.setUpdatedByUsername(entity.getUpdatedBy().getUsername());
            payload.setUpdatedByFullName(CommonUtil.composeFullName(entity.getUpdatedBy().getFirstName(),
                    entity.getUpdatedBy().getLastName()));
        }
        if(Objects.nonNull(entity.getCreatedAt())) payload.setCreatedAt(CommonUtil.instantToDateTime(entity.getCreatedAt()));
        if(Objects.nonNull(entity.getUpdatedAt())) payload.setUpdatedAt(CommonUtil.instantToDateTime(entity.getUpdatedAt()));
    }
}
