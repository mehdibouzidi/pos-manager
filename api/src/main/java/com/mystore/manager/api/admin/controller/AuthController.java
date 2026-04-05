package com.mystore.manager.api.admin.controller;

import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.payload.LoginPayload;
import com.mystore.manager.api.admin.payload.UserPayload;
import com.mystore.manager.api.admin.repository.UserRepository;
import com.mystore.manager.api.admin.service.impl.JWTService;
import com.mystore.manager.api.admin.service.impl.RsaKeyService;
import com.mystore.manager.api.admin.service.inter.ISessionLogService;
import com.mystore.manager.api.admin.service.inter.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.Optional;

import static com.mystore.manager.api.admin.util.AdminConstants.*;


@RestController
@CrossOrigin
@RequestMapping
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private IUserService userService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ISessionLogService sessionLogService;

    @Autowired
    private RsaKeyService rsaKeyService;

    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationInMs;

    @Value("${app.cookieSecure:false}")
    private boolean cookieSecure;

    @Value("${app.cookieSameSite:Lax}")
    private String cookieSameSite;

    /** Exposes the RSA public key so the frontend can encrypt the password before sending it. */
    @GetMapping(value = PUBLIC_KEY_EP, produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getPublicKey() {
        return ResponseEntity.ok(rsaKeyService.getPublicKeyBase64());
    }

    /** Clears the httpOnly JWT cookie, effectively logging the user out. */
    @PostMapping(value = LOGOUT_EP)
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie clearCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite(cookieSameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());
        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = LOGIN_EP, method = RequestMethod.POST)
    public ResponseEntity<LoginPayload> createAuthenticationToken(@RequestBody LoginPayload payload, HttpServletRequest request, HttpServletResponse response) throws Exception {

        // Decrypt the RSA-OAEP-encrypted password sent by the frontend
        String plainPassword;
        try {
            plainPassword = rsaKeyService.decrypt(payload.getPassword());
        } catch (Exception e) {
            log.error("RSA password decryption failed at login", e);
            LoginPayload errorResponse = new LoginPayload();
            errorResponse.setErrorCode("DECRYPTION_ERROR");
            errorResponse.setErrorMessage("Erreur lors du déchiffrement du mot de passe.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        // First, check if user exists
        Optional<UserEntity> userEntityOpt = userRepository.findByUsernameOrEmail(
                payload.getUsernameOrEmail(), 
                payload.getUsernameOrEmail()
        );
        
        if (userEntityOpt.isEmpty()) {
            LoginPayload errorResponse = new LoginPayload();
            errorResponse.setErrorCode("USER_NOT_FOUND");
            errorResponse.setErrorMessage("Utilisateur introuvable");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        
        UserEntity userEntity = userEntityOpt.get();
        
        // Determine the POS to use for login
        PosEntity pos = null;
        
        if (!userEntity.isSuperAdmin()) {
            // Non-superAdmin: use the POS assigned to the user
            pos = userEntity.getPos();
        }
        // SuperAdmin logs in without POS context (can access everything)
        
        // Check if user is active
        if (!userEntity.isActive()) {
            LoginPayload errorResponse = new LoginPayload();
            errorResponse.setErrorCode("USER_INACTIVE");
            errorResponse.setErrorMessage("Votre compte est désactivé. Veuillez contacter l'administrateur.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(payload.getUsernameOrEmail(), plainPassword)
            );
        }
        catch (BadCredentialsException e) {
            throw new Exception("Incorrect username or password", e);
        }

        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(payload.getUsernameOrEmail());

        // Pass POS info to JWT generation (null for superAdmin without POS)
        Integer posId = pos != null ? pos.getId() : null;
        String posCode = pos != null ? pos.getCode() : null;
        final String jwt = jwtService.generateToken(userDetails, posId, posCode, userEntity.isSuperAdmin());

        UserPayload user = userService.findByUsernameOrEmail(userDetails.getUsername());

        LoginPayload result = new LoginPayload();
        result.setUsernameOrEmail(user.getUsername());
        result.setPrivileges(user.getPrivilegesCodes());
        result.setFirstName(user.getFirstName());
        result.setLastName(user.getLastName());
        result.setActive(user.isActive());
        result.setSuperAdmin(userEntity.isSuperAdmin());
        
        // Set POS info in response (if user has a POS)
        if (pos != null) {
            result.setPosId(pos.getId());
            result.setPosCode(pos.getCode());
            result.setPosName(pos.getName());
        }

        if (result.isActive()) {
            // Set JWT as an httpOnly cookie — never exposed to JavaScript
            ResponseCookie jwtCookie = ResponseCookie.from("jwt", jwt)
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .maxAge(Duration.ofMillis(jwtExpirationInMs))
                    .sameSite(cookieSameSite)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

            // Return expiry timestamp so the frontend can manage session without reading the token
            result.setTokenExpiry(System.currentTimeMillis() + jwtExpirationInMs);

            sessionLogService.recordLogin(userEntity, pos, request.getRemoteAddr());
        }

        return ResponseEntity.ok(result);
    }


    @PostMapping(path = SIGN_IN_EP, consumes = MediaType.MULTIPART_FORM_DATA_VALUE,produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserPayload> signin(
            @RequestPart(value="picture", required = false) MultipartFile picture,
            @RequestPart("user") UserPayload payload
    ){
        payload.setPictureIn(picture);
        UserPayload response = userService.save(payload);
        return new ResponseEntity(response, HttpStatus.OK);
    }
}
