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

    private String token;

    private boolean isActive;
    
    private boolean superAdmin;

    private Set<String> privileges;
    
    // POS info
    private Integer posId;
    private String posCode;
    private String posName;
    
    // Error handling
    private String errorCode;
    private String errorMessage;

    // Epoch-millis timestamp at which the session expires (for frontend session tracking)
    private Long tokenExpiry;

}
