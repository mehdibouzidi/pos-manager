package com.mystore.manager.api.common.annotation;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to restrict access to SuperAdmin users only.
 * Used for managing configuration data (PaymentType, etc.)
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("@securityService.isSuperAdmin()")
public @interface SuperAdminOnly {
}
