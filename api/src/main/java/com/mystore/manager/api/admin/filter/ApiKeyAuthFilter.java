package com.mystore.manager.api.admin.filter;

import com.mystore.manager.api.admin.model.ApiKeyEntity;
import com.mystore.manager.api.admin.repository.ApiKeyRepository;
import com.mystore.manager.api.common.context.PosContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static com.mystore.manager.api.admin.util.PrivilegeConstants.*;

public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-Api-Key";

    private final ApiKeyRepository apiKeyRepository;

    public ApiKeyAuthFilter(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String apiKey = request.getHeader(API_KEY_HEADER);

        if (apiKey != null && !apiKey.isBlank() && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<ApiKeyEntity> entityOpt = apiKeyRepository.findByKeyValue(apiKey);

            if (entityOpt.isPresent() && entityOpt.get().isActive() && entityOpt.get().getPos() != null) {
                ApiKeyEntity entity = entityOpt.get();

                List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority(POS_TERMINAL),
                        new SimpleGrantedAuthority(SALE_CREATE),
                        new SimpleGrantedAuthority(CAISSE_SESSION_CREATE),
                        new SimpleGrantedAuthority(CAISSE_SESSION_CLOSE),
                        new SimpleGrantedAuthority(CAISSE_SESSION_READ),
                        new SimpleGrantedAuthority(PRODUCT_READ)
                );

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        entity.getPos().getCode(), null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

                PosContext.setPosId(entity.getPos().getId());
                PosContext.setPosCode(entity.getPos().getCode());
                PosContext.setSuperAdmin(false);
            }
        }

        try {
            chain.doFilter(request, response);
        } finally {
            // PosContext is cleared by JwtRequestFilter's finally block,
            // but if ApiKeyAuthFilter runs alone we clear it here too.
            if (apiKey != null && !apiKey.isBlank()) {
                PosContext.clear();
            }
        }
    }
}
