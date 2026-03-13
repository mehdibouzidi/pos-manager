package com.mystore.manager.api.common.mapper;

import com.mystore.manager.api.admin.model.StoreEntity;
import com.mystore.manager.api.admin.repository.StoreRepository;
import com.mystore.manager.api.common.context.StoreContext;
import com.mystore.manager.api.common.model.AbstractBusinessGlobalData;
import com.mystore.manager.api.common.payload.GlobalDataPayload;
import com.mystore.manager.api.common.util.CommonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Mapper for business entities that extend AbstractBusinessGlobalData (with store and code/name).
 * Use GlobalAuditMapper for admin entities without store.
 * 
 * This mapper automatically assigns the store from the current JWT context
 * when creating new entities (when entity.getId() is null or entity.getStore() is null).
 */
@Component
public class BusinessGlobalDataMapper {
    
    private static StoreRepository storeRepository;
    
    @Autowired
    public void setStoreRepository(StoreRepository storeRepository) {
        BusinessGlobalDataMapper.storeRepository = storeRepository;
    }
    
    /**
     * Maps payload to entity. For new entities, automatically assigns store from JWT context.
     * For existing entities (when entity.getStore() is already set), preserves the store.
     */
    public static <T extends GlobalDataPayload, E extends AbstractBusinessGlobalData> E payloadToEntity(T payload, E entity) {
        if(Objects.nonNull(payload.getId())) entity.setId(payload.getId());
        if(Objects.nonNull(payload.getCode())) entity.setCode(payload.getCode());
        if(Objects.nonNull(payload.getName())) entity.setName(payload.getName());
        
        // Automatically assign store from JWT context if not already set
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

    public static <E extends AbstractBusinessGlobalData, T extends GlobalDataPayload> T entityToPayload(E entity, T payload) {
        if(Objects.nonNull(entity.getId())) payload.setId(entity.getId());
        if(Objects.nonNull(entity.getCode())) payload.setCode(entity.getCode());
        if(Objects.nonNull(entity.getName())) payload.setName(entity.getName());
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
        // Map store fields (specific to business entities)
        if(Objects.nonNull(entity.getStore())) {
            payload.setStoreId(entity.getStore().getId());
            payload.setStoreCode(entity.getStore().getCode());
            payload.setStoreName(entity.getStore().getName());
        }
        if(Objects.nonNull(entity.getCreatedAt())) payload.setCreatedAt(CommonUtil.instantToDateTime(entity.getCreatedAt()));
        if(Objects.nonNull(entity.getUpdatedAt())) payload.setUpdatedAt(CommonUtil.instantToDateTime(entity.getUpdatedAt()));
        return payload;
    }
}
