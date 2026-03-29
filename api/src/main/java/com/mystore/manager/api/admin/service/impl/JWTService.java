package com.mystore.manager.api.admin.service.impl;

import com.mystore.manager.api.admin.util.AdminConstants;
import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JWTService {

    private static final Logger logger = LoggerFactory.getLogger(JWTService.class);

    @Value("${app.jwtSecret}")
    private String SECRET_KEY;

    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationInMs;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public Integer extractPosId(String token) {
        return extractClaim(token, claims -> claims.get("posId", Integer.class));
    }
    
    public String extractPosCode(String token) {
        return extractClaim(token, claims -> claims.get("posCode", String.class));
    }
    
    public Boolean extractSuperAdmin(String token) {
        return extractClaim(token, claims -> claims.get("superAdmin", Boolean.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    private Claims extractAllClaims(String token) {
        return Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token).getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * @deprecated Use {@link #generateToken(UserDetails, Integer, String, boolean)} instead
     */
    @Deprecated
    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails, null, null, false);
    }
    
    public String generateToken(UserDetails userDetails, Integer posId, String posCode, boolean superAdmin) {
        Map<String, Object> claims = new HashMap<>();
        boolean isAdmin = false;
        boolean isActive = userDetails.isEnabled();

        List<String> profileCodes = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        if (!profileCodes.isEmpty()) {
            isAdmin = profileCodes.contains(AdminConstants.ADMIN_PROFIL_CODE);
        }

        claims.put("isAdmin", isAdmin);
        claims.put("isActive", isActive);
        claims.put("superAdmin", superAdmin);
        
        // Add POS info to token
        if (posId != null) {
            claims.put("posId", posId);
        }
        if (posCode != null) {
            claims.put("posCode", posCode);
        }

        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder().setClaims(claims).setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY).compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }
        return false;
    }
}
