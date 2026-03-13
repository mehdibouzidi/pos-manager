package com.mystore.manager.api.admin.service.impl;


import com.mystore.manager.api.admin.model.UserEntity;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class AuditorAwareImpl implements AuditorAware<UserEntity> {


    @Override
    public Optional<UserEntity> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }


        // Fetch the UserEntity from the database
        return Optional.of((UserEntity) authentication.getPrincipal());
    }

}
