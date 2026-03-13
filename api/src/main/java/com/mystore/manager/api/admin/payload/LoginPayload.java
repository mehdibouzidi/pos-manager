package com.mystore.manager.api.admin.payload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import java.util.Set;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class LoginPayload {
    private String firstName;
    private String lastName;

    @NotBlank
    private String usernameOrEmail;

    @NotBlank
    private String password;
    
    // Store code entered by user at login (for non-superadmin users)
    private String storeCodeInput;

    private String token;

    private boolean isActive;
    
    private boolean superAdmin;

    private Set<String> privileges;
    
    // Store info
    private Integer storeId;
    private String storeCode;
    private String storeName;
    
    // Error handling
    private String errorCode;
    private String errorMessage;

}
