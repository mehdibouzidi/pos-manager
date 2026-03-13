package com.mystore.manager.api.common.payload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GlobalDatePayload {
    private Integer id;
    private String createdAt;
    private String updatedAt;
}
