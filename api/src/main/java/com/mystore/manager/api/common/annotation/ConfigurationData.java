package com.mystore.manager.api.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark entities as configuration data.
 * Configuration data:
 * - Is managed (CRUD) only by SuperAdmin users
 * - Is accessible (READ) by all authenticated users for dropdowns/references
 * - Does not have a store association (global data)
 * 
 * Examples: PaymentType, etc.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ConfigurationData {
    
    /**
     * Description of the configuration data purpose
     */
    String description() default "";
}
