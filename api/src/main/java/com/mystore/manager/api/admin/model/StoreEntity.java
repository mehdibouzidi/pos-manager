package com.mystore.manager.api.admin.model;

import com.mystore.manager.api.admin.util.AdminConstants;
import com.mystore.manager.api.common.model.AbstractGlobalData;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(schema = AdminConstants.ADMIN_SCH, name = AdminConstants.STORES_TABLE)
public class StoreEntity extends AbstractGlobalData {

    @Column(name = "address")
    private String address;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "active")
    private boolean active = true;

}
