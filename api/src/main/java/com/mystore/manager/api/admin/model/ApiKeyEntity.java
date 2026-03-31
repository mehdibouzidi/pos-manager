package com.mystore.manager.api.admin.model;

import com.mystore.manager.api.admin.util.AdminConstants;
import com.mystore.manager.api.common.model.AbstractUserDateAudit;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"pos"})
@Table(schema = AdminConstants.ADMIN_SCH, name = AdminConstants.API_KEY_TABLE)
public class ApiKeyEntity extends AbstractUserDateAudit {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pos_fk")
    private PosEntity pos;

    @Column(name = "key_value", unique = true, nullable = false)
    private String keyValue;

    @Column(name = "description")
    private String description;

    @Column(name = "active")
    private boolean active = true;
}
