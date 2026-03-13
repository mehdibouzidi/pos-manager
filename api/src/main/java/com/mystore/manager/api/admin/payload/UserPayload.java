package com.mystore.manager.api.admin.payload;


import com.mystore.manager.api.common.payload.GlobalDataPayload;
import com.mystore.manager.api.common.payload.GlobalDatePayload;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserPayload extends GlobalDatePayload {
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String email;
    private MultipartFile pictureIn;
    private byte[] picture;
    private boolean isActive;
    private boolean superAdmin;
    private List<ProfilPayload> profils;
    
    // Store info
    private Integer storeId;
    private String storeCode;
    private String storeName;

    public Set<String> getPrivilegesCodes() {
        if(profils == null || profils.isEmpty()) {
            return Set.of(); // Return an empty set if profils is null or empty
        }

        return this.getProfils().stream()
                .filter(profil -> profil.getPrivileges() != null) // Ensure privileges are not null
                .flatMap(profil -> profil.getPrivileges().stream()) // Flatten privileges
                .map(GlobalDataPayload::getCode) // Map to Codes
                .collect(Collectors.toSet()); // Collect as a Set
    }
}
