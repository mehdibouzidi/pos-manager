package com.mystore.manager.api.common.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties(
        value = {"code", "name"},
        allowGetters = true
)
@Data
public abstract class AbstractGlobalData extends AbstractUserDateAudit {

    @Column(unique=true, nullable = false)
    private String code;

    private String name;

    public String getFullName() {
        return code + " - " + name;
    }

}
