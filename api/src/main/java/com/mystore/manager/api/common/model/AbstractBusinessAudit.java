package com.mystore.manager.api.common.model;

import com.mystore.manager.api.admin.model.PosEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Base class for BUSINESS entities that need store association for multi-tenancy.
 * Extends AbstractUserDateAudit and adds the store field.
 * 
 * Use this for business data tables (data_product, data_customer, etc.)
 * Do NOT use for admin entities (admin_users, admin_profils, etc.)
 */
@MappedSuperclass
@JsonIgnoreProperties(
        value = {"createdBy", "updatedBy", "pos"},
        allowGetters = true
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"pos"})
public abstract class AbstractBusinessAudit extends AbstractUserDateAudit {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pos_fk")
    private PosEntity pos;

}
