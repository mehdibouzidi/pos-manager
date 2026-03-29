package com.mystore.manager.api.common.payload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GlobalUserDatePayload extends GlobalDatePayload {
    private Integer createdById;
    private String createdByUsername;
    private String createdByFullName;
    private Integer updatedById;
    private String updatedByUsername;
    private String updatedByFullName;
    
    // POS information for multi-tenancy
    private Integer posId;
    private String posCode;
    private String posName;
}
