package com.mystore.manager.api.admin.payload;

import com.mystore.manager.api.common.payload.GlobalDatePayload;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SessionLogPayload extends GlobalDatePayload {
    private Integer userId;
    private String userUsername;
    private String userFullName;
    private Integer posId;
    private String posCode;
    private String posName;
    private String ipAddress;
    private String loginAt;
}
