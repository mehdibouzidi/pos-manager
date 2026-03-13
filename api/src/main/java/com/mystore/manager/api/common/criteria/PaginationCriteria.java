package com.mystore.manager.api.common.criteria;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PaginationCriteria {
    private Integer pages;
    private Integer size;
    private String sort;
    private String sortColumn;
}
