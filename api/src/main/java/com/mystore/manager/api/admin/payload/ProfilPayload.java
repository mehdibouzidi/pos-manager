package com.mystore.manager.api.admin.payload;


import com.mystore.manager.api.common.payload.GlobalDataPayload;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProfilPayload extends GlobalDataPayload {
    private List<PrivilegePayload> privileges;
}
