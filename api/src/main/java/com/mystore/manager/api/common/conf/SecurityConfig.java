package com.mystore.manager.api.common.conf;

import com.mystore.manager.api.admin.filter.JwtRequestFilter;
import com.mystore.manager.api.admin.service.impl.JWTService;
import com.mystore.manager.api.admin.service.impl.MainUserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.function.Consumer;

import static com.mystore.manager.api.admin.util.AdminConstants.*;
import static com.mystore.manager.api.admin.util.PrivilegeConstants.*;
import static com.mystore.manager.api.business.common.util.BusinessConstants.*;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final MainUserService userDetailsService;
    private final JWTService jwtService;

    public SecurityConfig(MainUserService userDetailsService, JWTService jwtService) {
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private Consumer<AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry> adminRules()  {
        return auth -> {

            auth.requestMatchers("/actuator/**").permitAll();
            auth.requestMatchers("/actuator/prometheus").permitAll();
            
            // Health check endpoints (public)
            auth.requestMatchers("/api/health/**").permitAll();

            //Admin-----------------------------------------------------------------------------------------
            auth.requestMatchers(HttpMethod.POST, SLASH + LOGIN_EP).permitAll();
            
            // Public endpoint to check if user is superadmin (for login form)
            auth.requestMatchers(HttpMethod.GET, SLASH + USER_CONTROLLER + "/check-superadmin/**").permitAll();

            //Privilege
            auth.requestMatchers(HttpMethod.POST, SLASH + PRIVILEGE_CONTROLLER + SLASH + ADD_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.PUT, SLASH + PRIVILEGE_CONTROLLER + SLASH + UPDATE_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.DELETE, SLASH + PRIVILEGE_CONTROLLER + ID_PARAM).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + PRIVILEGE_CONTROLLER + ID_PARAM).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + PRIVILEGE_CONTROLLER + SLASH + FIND_ALL_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + PRIVILEGE_CONTROLLER + SLASH + FIND_ALL_BY_CRITERIA_EP).hasAnyAuthority(ADMIN);

            //Profil
            auth.requestMatchers(HttpMethod.POST, SLASH + PROFIL_CONTROLLER + SLASH + ADD_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.PUT, SLASH + PROFIL_CONTROLLER + SLASH + UPDATE_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.DELETE, SLASH + PROFIL_CONTROLLER + ID_PARAM).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + PROFIL_CONTROLLER + ID_PARAM).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + PROFIL_CONTROLLER + SLASH + FIND_ALL_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + PROFIL_CONTROLLER + SLASH + FIND_ALL_BY_CRITERIA_EP).hasAnyAuthority(ADMIN);

            //User
            auth.requestMatchers(HttpMethod.POST, SLASH + SIGN_IN_EP).hasAnyAuthority(ADMIN);

            auth.requestMatchers(HttpMethod.POST, SLASH + USER_CONTROLLER + SLASH + ADD_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.PUT, SLASH + USER_CONTROLLER + SLASH + UPDATE_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.PUT, SLASH + USER_CONTROLLER + SLASH + RESET_PASSWORD_EP).hasAnyAuthority(RESET_PASSWORD);
            auth.requestMatchers(HttpMethod.PUT, SLASH + USER_CONTROLLER + SLASH + DISABLE_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.DELETE, SLASH + USER_CONTROLLER + ID_PARAM).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + USER_CONTROLLER + ID_PARAM).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + USER_CONTROLLER + SLASH + FIND_ALL_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + USER_CONTROLLER + SLASH + FIND_ALL_BY_CRITERIA_EP).hasAnyAuthority(ADMIN);

            //POS
            auth.requestMatchers(HttpMethod.POST, SLASH + POS_CONTROLLER + SLASH + ADD_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.PUT, SLASH + POS_CONTROLLER + SLASH + UPDATE_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.DELETE, SLASH + POS_CONTROLLER + ID_PARAM).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + POS_CONTROLLER + ID_PARAM).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + POS_CONTROLLER + SLASH + FIND_ALL_EP).hasAnyAuthority(ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + POS_CONTROLLER + SLASH + FIND_ALL_BY_CRITERIA_EP).hasAnyAuthority(ADMIN);

            //API Key
            auth.requestMatchers(HttpMethod.POST, SLASH + API_KEY_CONTROLLER + SLASH + ADD_EP).hasAnyAuthority(API_KEY_CREATE, ADMIN);
            auth.requestMatchers(HttpMethod.PUT, SLASH + API_KEY_CONTROLLER + SLASH + UPDATE_EP).hasAnyAuthority(API_KEY_UPDATE, ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + API_KEY_CONTROLLER + "/regenerate/**").hasAnyAuthority(API_KEY_UPDATE, ADMIN);
            auth.requestMatchers(HttpMethod.DELETE, SLASH + API_KEY_CONTROLLER + ID_PARAM).hasAnyAuthority(API_KEY_DELETE, ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + API_KEY_CONTROLLER + ID_PARAM).hasAnyAuthority(API_KEY_READ, ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + API_KEY_CONTROLLER + SLASH + FIND_ALL_EP).hasAnyAuthority(API_KEY_READ, ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + API_KEY_CONTROLLER + SLASH + FIND_ALL_BY_CRITERIA_EP).hasAnyAuthority(API_KEY_READ, ADMIN);

            //Session Log
            auth.requestMatchers(HttpMethod.GET, SLASH + SESSION_LOG_CONTROLLER + ID_PARAM).hasAnyAuthority(SESSION_LOG_READ, ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + SESSION_LOG_CONTROLLER + SLASH + FIND_ALL_EP).hasAnyAuthority(SESSION_LOG_READ, ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + SESSION_LOG_CONTROLLER + SLASH + FIND_ALL_BY_CRITERIA_EP).hasAnyAuthority(SESSION_LOG_READ, ADMIN);
        };
    }

    private Consumer<AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry> businessSupplyRules() {
        return auth -> {

            // ProductController
            auth.requestMatchers(HttpMethod.POST, SLASH + PRODUCT_CONTROLLER + SLASH + ADD_EP).hasAnyAuthority(PRODUCT_CREATE, ADMIN);
            auth.requestMatchers(HttpMethod.PUT, SLASH + PRODUCT_CONTROLLER + SLASH + UPDATE_EP).hasAnyAuthority(PRODUCT_UPDATE, ADMIN);
            auth.requestMatchers(HttpMethod.DELETE, SLASH + PRODUCT_CONTROLLER + ID_PARAM).hasAnyAuthority(PRODUCT_DELETE, ADMIN);
            auth.requestMatchers(HttpMethod.DELETE, SLASH + PRODUCT_CONTROLLER + "/deleteids").hasAnyAuthority(PRODUCT_DELETE, ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + PRODUCT_CONTROLLER + ID_PARAM).hasAnyAuthority(PRODUCT_READ, ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + PRODUCT_CONTROLLER + SLASH + FIND_ALL_EP).hasAnyAuthority(PRODUCT_READ, ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + PRODUCT_CONTROLLER + SLASH + FIND_ALL_BY_CRITERIA_EP).hasAnyAuthority(PRODUCT_READ, ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + PRODUCT_CONTROLLER + SLASH + IMPORT).hasAnyAuthority(PRODUCT_CREATE, ADMIN);

            // ProductCategoryController
            auth.requestMatchers(HttpMethod.POST, SLASH + PRODUCT_CATEGORY_CONTROLLER + SLASH + ADD_EP).hasAnyAuthority(PRODUCT_CATEGORY_CREATE, ADMIN);
            auth.requestMatchers(HttpMethod.PUT, SLASH + PRODUCT_CATEGORY_CONTROLLER + SLASH + UPDATE_EP).hasAnyAuthority(PRODUCT_CATEGORY_UPDATE, ADMIN);
            auth.requestMatchers(HttpMethod.DELETE, SLASH + PRODUCT_CATEGORY_CONTROLLER + ID_PARAM).hasAnyAuthority(PRODUCT_CATEGORY_DELETE, ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + PRODUCT_CATEGORY_CONTROLLER + ID_PARAM).hasAnyAuthority(PRODUCT_CATEGORY_READ, ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + PRODUCT_CATEGORY_CONTROLLER + SLASH + FIND_ALL_EP).hasAnyAuthority(PRODUCT_CATEGORY_READ, PRODUCT_READ, ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + PRODUCT_CATEGORY_CONTROLLER + SLASH + FIND_ALL_BY_CRITERIA_EP).hasAnyAuthority(PRODUCT_CATEGORY_READ, ADMIN);

            // StockMovementController
            auth.requestMatchers(HttpMethod.POST, SLASH + STOCK_MOVEMENT_CONTROLLER + SLASH + ADD_EP).hasAnyAuthority(STOCK_MOVEMENT_CREATE, ADMIN);
            auth.requestMatchers(HttpMethod.PUT, SLASH + STOCK_MOVEMENT_CONTROLLER + SLASH + UPDATE_EP).hasAnyAuthority(STOCK_MOVEMENT_UPDATE, ADMIN);
            auth.requestMatchers(HttpMethod.DELETE, SLASH + STOCK_MOVEMENT_CONTROLLER + ID_PARAM).hasAnyAuthority(STOCK_MOVEMENT_DELETE, ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + STOCK_MOVEMENT_CONTROLLER + ID_PARAM).hasAnyAuthority(STOCK_MOVEMENT_READ, ADMIN);
            auth.requestMatchers(HttpMethod.GET, SLASH + STOCK_MOVEMENT_CONTROLLER + SLASH + FIND_ALL_EP).hasAnyAuthority(STOCK_MOVEMENT_READ, ADMIN);
            auth.requestMatchers(HttpMethod.POST, SLASH + STOCK_MOVEMENT_CONTROLLER + SLASH + FIND_ALL_BY_CRITERIA_EP).hasAnyAuthority(STOCK_MOVEMENT_READ, ADMIN);

        };
    }


    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable);

        http.authorizeHttpRequests(auth -> {
            adminRules().accept(auth);
            businessSupplyRules().accept(auth);
            auth.anyRequest().authenticated();
        });

        http.addFilterBefore(
                new JwtRequestFilter(authenticationManager(http.getSharedObject(AuthenticationConfiguration.class)), userDetailsService, jwtService),
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

}
