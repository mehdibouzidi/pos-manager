package com.mystore.manager.api.admin.payload;

import com.mystore.manager.api.common.payload.GlobalDataPayload;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class StorePayload extends GlobalDataPayload {
    private String address;
    private String phone;
    private String email;
    private boolean active = true;
}
