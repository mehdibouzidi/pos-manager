package com.mystore.manager.api.common.context;

/**
 * Holds the store context for the current request.
 * This is set from the JWT token during authentication and used
 * to automatically assign store to business entities.
 */
public class PosContext {
    
    private static final ThreadLocal<Integer> currentPosId = new ThreadLocal<>();
    private static final ThreadLocal<String> currentPosCode = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> isSuperAdmin = new ThreadLocal<>();
    
    public static void setPosId(Integer posId) {
        currentPosId.set(posId);
    }
    
    public static Integer getPosId() {
        return currentPosId.get();
    }
    
    public static void setPosCode(String posCode) {
        currentPosCode.set(posCode);
    }
    
    public static String getPosCode() {
        return currentPosCode.get();
    }
    
    public static void setSuperAdmin(Boolean superAdmin) {
        isSuperAdmin.set(superAdmin);
    }
    
    public static Boolean isSuperAdmin() {
        Boolean value = isSuperAdmin.get();
        return value != null && value;
    }
    
    /**
     * Clear the POS context. Should be called after request processing.
     */
    public static void clear() {
        currentPosId.remove();
        currentPosCode.remove();
        isSuperAdmin.remove();
    }
}
