package com.mystore.manager.api.admin.model;

import com.mystore.manager.api.admin.util.AdminConstants;
import com.mystore.manager.api.common.model.AbstractDateAudit;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Collection;
import java.util.List;

@Entity
@Data
@lombok.EqualsAndHashCode(callSuper = true, exclude = {"store", "address", "profils", "picture"})
@Table(schema = AdminConstants.ADMIN_SCH, name = AdminConstants.USERS_TABLE)
public class UserEntity extends AbstractDateAudit implements UserDetails {

    @NotBlank
    @Size(max = 50)
    @Column(name = "username", unique = true)
    private String username;

    @NotBlank
    @Size(max = 100)
    @Column(name = "password")
    private String password;
    @NotBlank
    @Size(max = 40)
    @Column(name = "first_name")
    private String firstName;

    @NotBlank
    @Size(max = 40)
    @Column(name = "last_name")
    private String lastName;

    @Size(max = 15)
    @Column(name = "phone_number")
    private String phoneNumber;


    @Size(max = 30)
    private String email;


    @Lob
    private byte[] picture;


    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private AdminAddressEntity address;

    private boolean active;
    
    @Column(name = "super_admin")
    private boolean superAdmin = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_fk", referencedColumnName = "id")
    private StoreEntity store;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = AdminConstants.USER_PROFILS_TABLE,
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "profil_id"),
            schema = AdminConstants.ADMIN_SCH
    )
    private List<ProfilEntity> profils;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.getProfils().stream()
                .filter(profil -> profil.getPrivileges() != null) // Ensure privileges are not null
                .flatMap(profil -> profil.getPrivileges().stream()) // Flatten privileges
                .map(privilege -> new SimpleGrantedAuthority(privilege.getAuthority())) // Map to SimpleGrantedAuthority
                .map(grantedAuthority -> (GrantedAuthority) grantedAuthority) // Explicitly cast to GrantedAuthority
                .distinct() // Ensure no duplicates
                .toList(); // Collect as a list;
    }

}