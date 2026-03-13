package com.mystore.manager.api.admin.payload;

import com.mystore.manager.api.common.payload.GlobalUserDatePayload;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AdminAddressPayload extends GlobalUserDatePayload {
    private String address;
    private String city;
    private String town;
    private String country;
    private String postalCode;
    private Double latitude;
    private Double longitude;
}
