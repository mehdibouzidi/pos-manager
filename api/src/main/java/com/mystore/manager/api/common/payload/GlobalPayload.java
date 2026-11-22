package com.mystore.manager.api.common.payload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GlobalPayload<T> {
    private Integer totalNumberOfElements;
    private Integer totalNumberOfPages;
    private List<T> elements;
    /** Sum over ALL the elements matching the filters (not just this page), when the list has an amount. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Double totalAmount;
}

