package com.mystore.manager.api.business.model;

import com.mystore.manager.api.common.model.AbstractBusinessGlobalData;
import com.mystore.manager.api.business.common.util.BusinessConstants;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


import javax.xml.bind.annotation.XmlRootElement;
import java.math.BigDecimal;

@Entity
@Table(
        schema = BusinessConstants.BUSINESS_SCH, 
        name = BusinessConstants.PRODUCT_TABLE,
        uniqueConstraints = @UniqueConstraint(columnNames = {"code", "store_fk"})
)
@XmlRootElement
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@org.hibernate.annotations.BatchSize(size = 50)
public class ProductEntity extends AbstractBusinessGlobalData {
    private Double maxStock;
    private Double minStock;
    
    @Column(name = "wholesale_price", precision = 19, scale = 4)
    private BigDecimal wholesalePrice; // Prix de Gros
    
    @Column(name = "retail_price", precision = 19, scale = 4)
    private BigDecimal retailPrice; // Prix détail de vente

    @Override
    public String toString() {
        return "ProductEntity{" +
                "code='" + getCode() + '\'' +
                ", name='" + getName() + '\'' +
                ", maxStock=" + maxStock +
                ", minStock=" + minStock +
                ", wholesalePrice=" + wholesalePrice +
                ", retailPrice=" + retailPrice +
                '}';
    }
}
