package com.mystore.manager.api.business.payload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mystore.manager.api.common.payload.GlobalDataPayload;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductCategoryPayload extends GlobalDataPayload {
    private String photo; // base64 encoded
}
