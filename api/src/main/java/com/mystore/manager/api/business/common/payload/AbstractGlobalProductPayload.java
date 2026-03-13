package com.mystore.manager.api.business.common.payload;

import com.mystore.manager.api.business.payload.ProductPayload;
import com.mystore.manager.api.common.payload.GlobalUserDatePayload;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.math.BigDecimal;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class AbstractGlobalProductPayload extends GlobalUserDatePayload {

    private ProductPayload product;

    private BigDecimal quantity;

}
