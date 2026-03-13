package com.mystore.manager.api.admin.payload;


import com.mystore.manager.api.common.payload.GlobalDataPayload;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PrivilegePayload extends GlobalDataPayload {
}
