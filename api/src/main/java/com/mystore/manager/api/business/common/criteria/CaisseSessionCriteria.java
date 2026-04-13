package com.mystore.manager.api.business.common.criteria;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mystore.manager.api.common.criteria.PaginationCriteria;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CaisseSessionCriteria extends PaginationCriteria {
    private Integer posId;
    private String status;
    private String fromDate;
    private String toDate;
}
