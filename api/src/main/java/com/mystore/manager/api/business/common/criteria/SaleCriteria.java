package com.mystore.manager.api.business.common.criteria;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mystore.manager.api.common.criteria.PaginationCriteria;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** Filters of the ticket list (one row per sale). */
@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SaleCriteria extends PaginationCriteria {
    private Integer posId;
    private Integer caisseSessionId;
    /** Tickets containing this product / a product of this category. */
    private Integer productId;
    private Integer categoryId;
    /** DINE_IN or TAKEAWAY. */
    private String orderType;
    /** Matches the server order number or the number printed by an offline till. */
    private Integer orderNumber;
    /** yyyy-MM-dd, inclusive, Algiers local day (filters saleDate). */
    private String fromDate;
    private String toDate;
}
