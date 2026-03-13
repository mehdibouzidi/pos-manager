package com.mystore.manager.api.common.service;

import com.mystore.manager.api.admin.model.StoreEntity;
import com.mystore.manager.api.admin.repository.StoreRepository;
import com.mystore.manager.api.common.context.StoreContext;
import org.springframework.stereotype.Service;

/**
 * Service to get the current store from the request context.
 * The store is extracted from the JWT token during authentication.
 */
@Service
public class StoreContextService {
    
    private final StoreRepository storeRepository;
    
    public StoreContextService(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }
    
    /**
     * Get the current store ID from the JWT context.
     * Returns null if user is superAdmin without a store context.
     */
    public Integer getCurrentStoreId() {
        return StoreContext.getStoreId();
    }
    
    /**
     * Get the current store code from the JWT context.
     */
    public String getCurrentStoreCode() {
        return StoreContext.getStoreCode();
    }
    
    /**
     * Check if current user is a superAdmin.
     */
    public boolean isSuperAdmin() {
        return StoreContext.isSuperAdmin();
    }
    
    /**
     * Get the current StoreEntity from the JWT context.
     * Returns null if no store in context (superAdmin without store).
     */
    public StoreEntity getCurrentStore() {
        Integer storeId = getCurrentStoreId();
        if (storeId == null) {
            return null;
        }
        return storeRepository.findById(storeId).orElse(null);
    }
    
    /**
     * Get the store reference for setting on entities.
     * This is more efficient than getCurrentStore() as it uses getReference()
     * which doesn't load the full entity.
     */
    public StoreEntity getStoreReference() {
        Integer storeId = getCurrentStoreId();
        if (storeId == null) {
            return null;
        }
        return storeRepository.getReferenceById(storeId);
    }
    
    /**
     * Check if current user has access to a specific store.
     * SuperAdmins can access all stores.
     */
    public boolean canAccessStore(Integer storeId) {
        if (isSuperAdmin()) {
            return true;
        }
        Integer currentStoreId = getCurrentStoreId();
        return currentStoreId != null && currentStoreId.equals(storeId);
    }
}
