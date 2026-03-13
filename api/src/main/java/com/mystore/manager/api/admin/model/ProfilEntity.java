package com.mystore.manager.api.admin.model;

import com.mystore.manager.api.admin.util.AdminConstants;
import com.mystore.manager.api.common.model.AbstractGlobalData;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(schema = AdminConstants.ADMIN_SCH, name = AdminConstants.PROFILS_TABLE)
public class ProfilEntity extends AbstractGlobalData {

    @ManyToMany(fetch = FetchType.EAGER, cascade = {})
    @JoinTable(
            name = "admin_profil_privileges",
            joinColumns = @JoinColumn(name = "profil_id"),
            inverseJoinColumns = @JoinColumn(name = "privilege_id"),
            schema = AdminConstants.ADMIN_SCH
    )
    private List<PrivilegeEntity> privileges;


}