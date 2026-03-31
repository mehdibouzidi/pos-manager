package com.mystore.manager.api.business.model;

import com.mystore.manager.api.business.common.util.BusinessConstants;
import com.mystore.manager.api.common.model.AbstractBusinessGlobalData;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.xml.bind.annotation.XmlRootElement;

@Entity
@Table(
        schema = BusinessConstants.BUSINESS_SCH,
        name = BusinessConstants.PRODUCT_CATEGORY_TABLE,
        uniqueConstraints = @UniqueConstraint(columnNames = {"code", "pos_fk"})
)
@XmlRootElement
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@org.hibernate.annotations.BatchSize(size = 50)
public class ProductCategoryEntity extends AbstractBusinessGlobalData {

    @Lob
    @Column(name = "photo")
    private byte[] photo;
}
