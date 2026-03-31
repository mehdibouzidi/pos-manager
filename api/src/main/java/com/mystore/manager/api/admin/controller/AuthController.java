package com.mystore.manager.api.admin.controller;

import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.payload.LoginPayload;
import com.mystore.manager.api.admin.payload.UserPayload;
import com.mystore.manager.api.admin.repository.UserRepository;
import com.mystore.manager.api.admin.service.impl.JWTService;
import com.mystore.manager.api.admin.service.inter.ISessionLogService;
import com.mystore.manager.api.admin.service.inter.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    private ISessionLogService sessionLogService;


    @RequestMapping(value = LOGIN_EP, method = RequestMethod.POST)
    public ResponseEntity<LoginPayload> createAuthenticationToken(@RequestBody LoginPayload payload, HttpServletRequest request) throws Exception {

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
                    new UsernamePasswordAuthenticationToken(payload.getUsernameOrEmail(), payload.getPassword())
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
            result.setToken(jwt);
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
