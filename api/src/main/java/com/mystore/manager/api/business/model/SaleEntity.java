package com.mystore.manager.api.business.model;

import com.mystore.manager.api.business.common.util.BusinessConstants;
import com.mystore.manager.api.common.model.AbstractBusinessAudit;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(schema = BusinessConstants.BUSINESS_SCH, name = BusinessConstants.SALE_TABLE)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SaleEntity extends AbstractBusinessAudit {

    @Column(name = "order_number", nullable = false)
    private Integer orderNumber;

    @Column(name = "sale_date")
    private Instant saleDate;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caisse_session_fk")
    private CaisseSessionEntity caisseSession;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SaleItemEntity> items = new ArrayList<>();
}
