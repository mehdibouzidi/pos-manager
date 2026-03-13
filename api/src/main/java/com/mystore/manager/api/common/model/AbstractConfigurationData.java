package com.mystore.manager.api.common.model;

import com.mystore.manager.api.admin.model.StoreEntity;
import com.mystore.manager.api.admin.model.UserEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.OneToOne;
import lombok.Data;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;

/**
 * Base class for configuration data entities.
 * Configuration data:
 * - Does NOT have a store association (global data)
 * - Is managed by SuperAdmin only
 * - Is accessible (read) by all authenticated users
 * 
 * Examples: PaymentType
 * 
 * Use this instead of AbstractUserDateAudit for configuration entities.
 */
@MappedSuperclass
@JsonIgnoreProperties(
        value = {"createdBy", "updatedBy"},
        allowGetters = true
)
@Data
@lombok.EqualsAndHashCode(callSuper = true, exclude = {"createdBy", "updatedBy"})
public abstract class AbstractConfigurationData extends AbstractDateAudit {

    @CreatedBy
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

    @LastModifiedBy
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserEntity updatedBy;

    // Note: NO store field - configuration data is global
}
