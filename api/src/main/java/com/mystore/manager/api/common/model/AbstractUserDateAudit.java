package com.mystore.manager.api.common.model;

import com.mystore.manager.api.admin.model.UserEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.OneToOne;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;

/**
 * Base class for entities with audit fields (createdBy, updatedBy).
 * This class does NOT include store - use AbstractBusinessAudit for business entities that need store.
 */
@MappedSuperclass
@JsonIgnoreProperties(
        value = {"createdBy", "updatedBy"},
        allowGetters = true
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"createdBy", "updatedBy"})
public abstract class AbstractUserDateAudit extends AbstractDateAudit {

    @CreatedBy
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

    @LastModifiedBy
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserEntity updatedBy;

}