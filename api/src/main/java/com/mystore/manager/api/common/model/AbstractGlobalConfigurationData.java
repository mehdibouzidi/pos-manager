package com.mystore.manager.api.common.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;

/**
 * Base class for configuration data entities with code and name.
 * Configuration data:
 * - Does NOT have a store association (global data)
 * - Is managed by SuperAdmin only
 * - Is accessible (read) by all authenticated users
 * 
 * Examples: PaymentType
 * 
 * Use this instead of AbstractGlobalData for configuration entities.
 */
@MappedSuperclass
@JsonIgnoreProperties(
        value = {"code", "name"},
        allowGetters = true
)
@Data
public abstract class AbstractGlobalConfigurationData extends AbstractConfigurationData {

    @Column(unique = true, nullable = false)
    private String code;

    private String name;

    public String getFullName() {
        return code + " - " + name;
    }
}
