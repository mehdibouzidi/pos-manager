package com.mystore.manager.api.business.common.criteria;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mystore.manager.api.common.criteria.PaginationCriteria;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class StockMovementCriteria extends PaginationCriteria {
    private Integer id;
    private Integer productId;
    private Integer categoryId;
    private Integer posId;
    private String movementType;
    private String reason;
}
