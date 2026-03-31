package com.mystore.manager.api.admin.criteria;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mystore.manager.api.common.criteria.PaginationCriteria;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SessionLogCriteria extends PaginationCriteria {
    private Integer id;
    private Integer userId;
    private Integer posId;
    private String ipAddress;
    private String loginAtFrom;
    private String loginAtTo;
}
