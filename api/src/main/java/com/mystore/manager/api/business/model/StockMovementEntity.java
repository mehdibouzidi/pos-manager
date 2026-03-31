package com.mystore.manager.api.business.model;

import com.mystore.manager.api.business.common.util.BusinessConstants;
import com.mystore.manager.api.common.model.AbstractBusinessAudit;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(schema = BusinessConstants.BUSINESS_SCH, name = BusinessConstants.STOCK_MOVEMENT_TABLE)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class StockMovementEntity extends AbstractBusinessAudit {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_fk")
    private ProductEntity product;

    @Column(name = "movement_type", nullable = false, length = 50)
    private String movementType;

    @Column(nullable = false)
    private Double quantity;

    private String reason;

    @Column(name = "movement_date")
    private Instant movementDate;
}
