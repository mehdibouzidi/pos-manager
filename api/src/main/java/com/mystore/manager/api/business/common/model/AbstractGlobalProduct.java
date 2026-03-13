package com.mystore.manager.api.business.common.model;

import com.mystore.manager.api.business.model.ProductEntity;
import com.mystore.manager.api.common.model.AbstractBusinessAudit;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@MappedSuperclass
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"product"})
public abstract class AbstractGlobalProduct extends AbstractBusinessAudit {

    @OneToOne
    @JoinColumn(name = "product_fk", referencedColumnName = "id")
    private ProductEntity product;

    private BigDecimal quantity;

}
