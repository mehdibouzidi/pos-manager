package com.mystore.manager.api.admin.service.impl;

import com.mystore.manager.api.admin.mapper.UserMapper;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MainUserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Override
    public UserEntity loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        Optional<UserEntity> user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
        user.orElseThrow(() -> new UsernameNotFoundException("Not found: " + usernameOrEmail));
        return user.get();
    }
}