package com.mystore.manager.api.admin.service.impl;

import com.mystore.manager.api.admin.model.UserEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service for security-related operations used in @PreAuthorize expressions.
 */
@Service("securityService")
public class SecurityService {

    /**
     * Check if the current authenticated user is a SuperAdmin.
     * Used by @SuperAdminOnly annotation.
     * 
     * @return true if user is superAdmin, false otherwise
     */
    public boolean isSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserEntity) {
            return ((UserEntity) principal).isSuperAdmin();
        }
        
        return false;
    }

    /**
     * Get the current authenticated user's store ID.
     * Returns null for superAdmin users (they can access all stores).
     * 
     * @return storeId or null
     */
    public Integer getCurrentUserStoreId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserEntity) {
            UserEntity user = (UserEntity) principal;
            if (user.isSuperAdmin()) {
                return null; // SuperAdmin can access all stores
            }
            return user.getStore() != null ? user.getStore().getId() : null;
        }
        
        return null;
    }

    /**
     * Get the current authenticated user.
     * 
     * @return UserEntity or null
     */
    public UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserEntity) {
            return (UserEntity) principal;
        }
        
        return null;
    }

    /**
     * Check if current user can access data from a specific store.
     * SuperAdmin can access all stores.
     * Regular users can only access their own store's data.
     * 
     * @param storeId the store ID to check access for
     * @return true if user can access the store's data
     */
    public boolean canAccessStore(Integer storeId) {
        if (storeId == null) {
            return true; // Global data accessible to all
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserEntity) {
            UserEntity user = (UserEntity) principal;
            if (user.isSuperAdmin()) {
                return true; // SuperAdmin can access all stores
            }
            return user.getStore() != null && user.getStore().getId().equals(storeId);
        }
        
        return false;
    }
}
