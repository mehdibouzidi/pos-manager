package com.mystore.manager.api.admin.filter;

import com.mystore.manager.api.admin.service.impl.JWTService;
import com.mystore.manager.api.admin.service.impl.MainUserService;
import com.mystore.manager.api.admin.util.AdminConstants;
import com.mystore.manager.api.common.context.StoreContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.tomcat.websocket.Constants;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import java.io.IOException;


public class JwtRequestFilter extends BasicAuthenticationFilter {

    private MainUserService userDetailsService;

    private JWTService jwtService;

    public JwtRequestFilter(AuthenticationManager authenticationManager, MainUserService userDetailsService, JWTService jwtService) {
        super(authenticationManager);
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Bypass JWT processing for actuator endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/actuator/prometheus")) {
            chain.doFilter(request, response);
            return;
        }

        // Clear store context at the start of each request
        StoreContext.clear();

        final String authorizationHeader = request.getHeader(Constants.AUTHORIZATION_HEADER_NAME);

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith(AdminConstants.BEARER)) {
            jwt = authorizationHeader.substring(7);
            username = jwtService.extractUsername(jwt);
            
            // Extract store info from JWT and set in context
            try {
                Integer storeId = jwtService.extractStoreId(jwt);
                String storeCode = jwtService.extractStoreCode(jwt);
                Boolean superAdmin = jwtService.extractSuperAdmin(jwt);
                
                StoreContext.setStoreId(storeId);
                StoreContext.setStoreCode(storeCode);
                StoreContext.setSuperAdmin(superAdmin != null ? superAdmin : false);
            } catch (Exception e) {
                // Log but don't fail - store context will be null
            }
        }


        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtService.validateToken(jwt, userDetails)) {

                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        
        try {
            chain.doFilter(request, response);
        } finally {
            // Clear store context after request processing
            StoreContext.clear();
        }
    }

}
