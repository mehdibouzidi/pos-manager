package com.mystore.manager.api.admin.controller;

import com.mystore.manager.api.admin.model.StoreEntity;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.payload.LoginPayload;
import com.mystore.manager.api.admin.payload.UserPayload;
import com.mystore.manager.api.admin.repository.StoreRepository;
import com.mystore.manager.api.admin.repository.UserRepository;
import com.mystore.manager.api.admin.service.impl.JWTService;
import com.mystore.manager.api.admin.service.inter.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;
import java.util.Optional;

import static com.mystore.manager.api.admin.util.AdminConstants.LOGIN_EP;
import static com.mystore.manager.api.admin.util.AdminConstants.SIGN_IN_EP;

@RestController
@CrossOrigin
@RequestMapping
public class AuthController {
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
    private StoreRepository storeRepository;


    @RequestMapping(value = LOGIN_EP, method = RequestMethod.POST)
    public ResponseEntity<LoginPayload> createAuthenticationToken(@RequestBody LoginPayload payload) throws Exception {

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
        
        // Determine the store to use for login
        StoreEntity store = null;
        
        if (userEntity.isSuperAdmin()) {
            // SuperAdmin: can login without store code, or with a specific store code to work in that store context
            if (StringUtils.hasText(payload.getStoreCodeInput())) {
                // SuperAdmin wants to login to a specific store
                Optional<StoreEntity> storeOpt = storeRepository.findByCode(payload.getStoreCodeInput());
                if (storeOpt.isEmpty()) {
                    LoginPayload errorResponse = new LoginPayload();
                    errorResponse.setErrorCode("STORE_NOT_FOUND");
                    errorResponse.setErrorMessage("Code magasin invalide : " + payload.getStoreCodeInput());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
                }
                store = storeOpt.get();
            }
            // If no store code provided, superAdmin logs in without store context (can access everything)
        } else {
            // Non-superAdmin: must provide store code at login
            if (!StringUtils.hasText(payload.getStoreCodeInput())) {
                LoginPayload errorResponse = new LoginPayload();
                errorResponse.setErrorCode("STORE_CODE_REQUIRED");
                errorResponse.setErrorMessage("Le code magasin est obligatoire");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Validate the store code
            Optional<StoreEntity> storeOpt = storeRepository.findByCode(payload.getStoreCodeInput());
            if (storeOpt.isEmpty()) {
                LoginPayload errorResponse = new LoginPayload();
                errorResponse.setErrorCode("STORE_NOT_FOUND");
                errorResponse.setErrorMessage("Code magasin invalide");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            store = storeOpt.get();
            
            // Verify user is assigned to this store
            if (Objects.isNull(userEntity.getStore()) || !userEntity.getStore().getId().equals(store.getId())) {
                LoginPayload errorResponse = new LoginPayload();
                errorResponse.setErrorCode("STORE_ACCESS_DENIED");
                errorResponse.setErrorMessage("Vous n'êtes pas autorisé à accéder à ce magasin");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }
        }
        
        // Check if user is active
        if (!userEntity.isActive()) {
            LoginPayload errorResponse = new LoginPayload();
            errorResponse.setErrorCode("USER_INACTIVE");
            errorResponse.setErrorMessage("Votre compte est désactivé. Veuillez contacter l'administrateur.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(payload.getUsernameOrEmail(), payload.getPassword())
            );
        }
        catch (BadCredentialsException e) {
            throw new Exception("Incorrect username or password", e);
        }

        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(payload.getUsernameOrEmail());

        // Pass store info to JWT generation (null for superAdmin without store)
        Integer storeId = store != null ? store.getId() : null;
        String storeCode = store != null ? store.getCode() : null;
        final String jwt = jwtService.generateToken(userDetails, storeId, storeCode, userEntity.isSuperAdmin());

        UserPayload user = userService.findByUsernameOrEmail(userDetails.getUsername());

        LoginPayload result = new LoginPayload();
        result.setUsernameOrEmail(user.getUsername());
        result.setPrivileges(user.getPrivilegesCodes());
        result.setFirstName(user.getFirstName());
        result.setLastName(user.getLastName());
        result.setActive(user.isActive());
        result.setSuperAdmin(userEntity.isSuperAdmin());
        
        // Set store info in response (if user has a store)
        if (store != null) {
            result.setStoreId(store.getId());
            result.setStoreCode(store.getCode());
            result.setStoreName(store.getName());
        }

        if(result.isActive()) result.setToken(jwt);

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
