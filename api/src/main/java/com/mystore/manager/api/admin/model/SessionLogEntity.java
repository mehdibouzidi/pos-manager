package com.mystore.manager.api.admin.model;

import com.mystore.manager.api.admin.util.AdminConstants;
import com.mystore.manager.api.common.model.AbstractDateAudit;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(schema = AdminConstants.ADMIN_SCH, name = AdminConstants.SESSION_LOG_TABLE)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SessionLogEntity extends AbstractDateAudit {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_fk")
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pos_fk")
    private PosEntity pos;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "login_at")
    private Instant loginAt;
}
