package com.mystore.manager.api.common.context;

/**
 * Holds the store context for the current request.
 * This is set from the JWT token during authentication and used
 * to automatically assign store to business entities.
 */
public class StoreContext {
    
    private static final ThreadLocal<Integer> currentStoreId = new ThreadLocal<>();
    private static final ThreadLocal<String> currentStoreCode = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> isSuperAdmin = new ThreadLocal<>();
    
    public static void setStoreId(Integer storeId) {
        currentStoreId.set(storeId);
    }
    
    public static Integer getStoreId() {
        return currentStoreId.get();
    }
    
    public static void setStoreCode(String storeCode) {
        currentStoreCode.set(storeCode);
    }
    
    public static String getStoreCode() {
        return currentStoreCode.get();
    }
    
    public static void setSuperAdmin(Boolean superAdmin) {
        isSuperAdmin.set(superAdmin);
    }
    
    public static Boolean isSuperAdmin() {
        Boolean value = isSuperAdmin.get();
        return value != null && value;
    }
    
    /**
     * Clear the store context. Should be called after request processing.
     */
    public static void clear() {
        currentStoreId.remove();
        currentStoreCode.remove();
        isSuperAdmin.remove();
    }
}
