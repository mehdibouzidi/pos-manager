package com.mystore.manager.api.common.payload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GlobalDataPayload extends GlobalUserDatePayload {
    private String code;
    private String name;

    public String getFullName() {
        return code + " - " + name;
    }
}
