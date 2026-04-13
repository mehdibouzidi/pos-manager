package com.mystore.manager.api.business.model;

import com.mystore.manager.api.business.common.util.BusinessConstants;
import com.mystore.manager.api.common.model.AbstractBusinessAudit;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(schema = BusinessConstants.BUSINESS_SCH, name = BusinessConstants.CAISSE_SESSION_TABLE)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class CaisseSessionEntity extends AbstractBusinessAudit {

    @Column(name = "opened_at", nullable = false)
    private Instant openedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "opening_balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal openingBalance;

    @Column(name = "closing_balance", precision = 19, scale = 4)
    private BigDecimal closingBalance;

    @Column(name = "total_sales_amount", precision = 19, scale = 4)
    private BigDecimal totalSalesAmount;

    @Column(name = "total_sales_count")
    private Integer totalSalesCount;

    @Column(name = "first_order_number")
    private Integer firstOrderNumber;

    @Column(name = "last_order_number")
    private Integer lastOrderNumber;

    @Column(name = "variance", precision = 19, scale = 4)
    private BigDecimal variance;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "notes", length = 500)
    private String notes;
}
