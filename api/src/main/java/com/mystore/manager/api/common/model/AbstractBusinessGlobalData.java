package com.mystore.manager.api.common.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Base class for BUSINESS entities that have code/name fields and need pos association.
 * Use this for business data tables (data_product, data_brand, etc.)
 * 
 * For admin entities (admin_pos, admin_profils), use AbstractGlobalData instead.
 * 
 * NOTE: The code field uniqueness is composite with pos_fk (unique per pos).
 * Each concrete entity must define: @Table(uniqueConstraints = @UniqueConstraint(columnNames = {"code", "pos_fk"}))
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties(
        value = {"code", "name", "pos"},
        allowGetters = true
)
@Data
@EqualsAndHashCode(callSuper = true)
public abstract class AbstractBusinessGlobalData extends AbstractBusinessAudit {

    @Column(nullable = false)
    private String code;

    private String name;

    public String getFullName() {
        return code + " - " + name;
    }

}
