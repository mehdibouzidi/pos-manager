package com.mystore.manager.api.admin.controller;

import com.mystore.manager.api.admin.criteria.UserCriteria;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.payload.ChangePasswordPayload;
import com.mystore.manager.api.admin.payload.UserPayload;
import com.mystore.manager.api.admin.repository.UserRepository;
import com.mystore.manager.api.admin.service.inter.IUserService;
import com.mystore.manager.api.common.exception.CRUDException;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

import static com.mystore.manager.api.admin.util.AdminConstants.*;
import static com.mystore.manager.api.common.constant.CommonConstants.FIND_ALL_BY_CRITERIA_EP;
import static com.mystore.manager.api.common.constant.CommonConstants.UPDATE_EP;

@CrossOrigin
@RestController
@RequestMapping( USER_CONTROLLER)
public class UserController {

    @Autowired
    private IUserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Public endpoint to check if a username belongs to a superadmin.
     * This is used during login to determine if store code field should be shown.
     */
    @GetMapping(path = "/check-superadmin/{username}")
    public ResponseEntity<Map<String, Boolean>> checkSuperAdmin(@PathVariable String username) {
        Optional<UserEntity> userOpt = userRepository.findByUsernameOrEmail(username, username);
        boolean isSuperAdmin = userOpt.map(UserEntity::isSuperAdmin).orElse(false);
        return ResponseEntity.ok(Map.of("superAdmin", isSuperAdmin));
    }

    @PutMapping( path=UPDATE_EP ,consumes = MediaType.MULTIPART_FORM_DATA_VALUE,produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserPayload> editUser(
            @RequestPart(value="picture", required = false) MultipartFile picture,
            @RequestPart("user") UserPayload UserPayload,
            @RequestHeader(name= HttpHeaders.AUTHORIZATION) String token
    ){
        UserPayload.setPictureIn(picture);
        try {
            UserPayload response = userService.edit(UserPayload, token);
            return new ResponseEntity(response, HttpStatus.OK);
        }catch (CRUDException exception){
            return new ResponseEntity(exception.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PutMapping(path = RESET_PASSWORD_EP, consumes = MediaType.APPLICATION_JSON_VALUE,produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Boolean> changePassword(
            @RequestBody ChangePasswordPayload payload,
            @RequestHeader(name= HttpHeaders.AUTHORIZATION) String token
    ){
        try {
            return new ResponseEntity(userService.changePassword(payload,token), HttpStatus.OK);
        }catch (CRUDException exception){
            return new ResponseEntity(exception.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PutMapping(path = DISABLE_EP, consumes = MediaType.APPLICATION_JSON_VALUE,produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Boolean> disableUser(
            @RequestHeader(name= HttpHeaders.AUTHORIZATION) String token,
            @RequestBody UserPayload userPayload
    ){
        return new ResponseEntity(userService.disable(token, userPayload), HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<UserPayload> getUserByUsername(
            @PathVariable Integer id
    ) {
        return new ResponseEntity(userService.findById(id), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<UserPayload>> findAllUsersByCriteria(
            @RequestBody UserCriteria criteria
    ) {
        return new ResponseEntity(userService.findByCriteria(criteria), HttpStatus.OK);
    }
}
