package com.mystore.manager.api.admin.model;

import com.mystore.manager.api.admin.util.AdminConstants;
import com.mystore.manager.api.common.model.AbstractGlobalData;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;

import java.util.Objects;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(schema = AdminConstants.ADMIN_SCH, name = AdminConstants.PRIVILEGES_TABLE)
public class PrivilegeEntity extends AbstractGlobalData implements GrantedAuthority {

    @Override
    public String getAuthority() {
        return this.getCode(); // Use the code as the authority
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PrivilegeEntity that = (PrivilegeEntity) o;
        return Objects.equals(getCode(), that.getCode());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getCode());
    }
}