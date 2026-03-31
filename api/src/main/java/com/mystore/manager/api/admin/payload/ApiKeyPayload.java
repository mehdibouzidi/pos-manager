package com.mystore.manager.api.admin.payload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mystore.manager.api.common.payload.GlobalUserDatePayload;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApiKeyPayload extends GlobalUserDatePayload {
    private String keyValue;
    private String description;
    private boolean active = true;
}
