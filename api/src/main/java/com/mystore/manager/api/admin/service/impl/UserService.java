package com.mystore.manager.api.admin.service.impl;


import com.mystore.manager.api.admin.criteria.UserCriteria;
import com.mystore.manager.api.admin.enums.AdminError;
import com.mystore.manager.api.admin.mapper.UserMapper;
import com.mystore.manager.api.admin.model.ProfilEntity;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.payload.ChangePasswordPayload;
import com.mystore.manager.api.admin.payload.UserPayload;
import com.mystore.manager.api.admin.repository.UserRepository;
import com.mystore.manager.api.admin.service.inter.IProfilService;
import com.mystore.manager.api.admin.service.inter.IUserService;
import com.mystore.manager.api.common.exception.CRUDException;
import com.mystore.manager.api.common.payload.GlobalPayload;
import com.mystore.manager.api.common.util.CommonUtil;
import io.jsonwebtoken.lang.Collections;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static com.mystore.manager.api.admin.util.AdminConstants.BEARER;


@Service
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final IProfilService profilService;
    private PasswordEncoder passwordEncoder;
    private JWTService jwtService;
    private final UserMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public UserService(UserRepository userRepository, IProfilService profilService, PasswordEncoder passwordEncoder, JWTService jwtService, UserMapper mapper) {
        this.userRepository = userRepository;
        this.profilService = profilService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    @Override
    public UserPayload save(UserPayload payload) {
        UserEntity userEntity = mapper.payloadToEntity(payload,new UserEntity());

        String password = payload.getPassword();
        userEntity.setPassword(password.isEmpty() ? null : passwordEncoder.encode(password));

        return mapper.entityToPayload(userRepository.save(userEntity),true);
    }

    @Override
    public UserEntity saveEntity(UserEntity userEntity) {
        return userRepository.save(userEntity);
    }

    @Override
    public UserPayload edit(UserPayload payload, String token) throws CRUDException {
            Optional<UserEntity> userOpt = userRepository.findById(payload.getId());
            if(userOpt.isPresent()){
                UserEntity userEntity = userOpt.get();
                if(payload.getFirstName() != null &&
                        !payload.getFirstName().equalsIgnoreCase(userEntity.getFirstName())){
                    userEntity.setFirstName(payload.getFirstName());
                }
                if(payload.getLastName() != null &&
                        !payload.getLastName().equalsIgnoreCase(userEntity.getLastName())){
                    userEntity.setLastName(payload.getLastName());
                }
                if(payload.getUsername() != null &&
                        !payload.getUsername().equalsIgnoreCase(userEntity.getUsername())){
                    userEntity.setUsername(payload.getUsername());
                }

                if (!Collections.isEmpty(payload.getProfils())) {
                    List<ProfilEntity> profils = payload.getProfils().stream()
                            .map(item -> profilService.findByCode(item.getCode()))
                            .toList();
                    userEntity.getProfils().clear(); // Vider la liste existante
                    userEntity.getProfils().addAll(profils); // Ajouter les nouveaux éléments
                }

                byte[] newPicture = CommonUtil.multipartFileToBytes(payload.getPictureIn());
                if (userEntity.getPicture() != newPicture) {
                    userEntity.setPicture(newPicture);
                }
                return mapper.entityToPayload(userRepository.save(userEntity),true);
            }
        throw new CRUDException(AdminError.USER_CANNOT_UPDATED.getLibelle());
    }

    @Override
    public boolean changePassword(ChangePasswordPayload requestDTO, String token) throws CRUDException{
        String connectedUsername = getUsernameFromToken(token);
        Optional<UserEntity> userOpt = userRepository.findByUsername(connectedUsername);
        String oldPassword = requestDTO.getOldPassword();
        String newPassword = requestDTO.getNewPassword();
        String newPasswordConfirmed = requestDTO.getNewPasswordConfirmed();
        String encryptedNewPassword = Strings.EMPTY;
        UserEntity userEntity = null;
        if(userOpt.isPresent()){
            userEntity = userOpt.get();
            if(!Strings.isBlank( oldPassword) && !Strings.isBlank(newPassword) && !Strings.isBlank(newPasswordConfirmed)){
                encryptedNewPassword = passwordEncoder.encode(requestDTO.getNewPassword());
                if( passwordEncoder.matches(oldPassword, userEntity.getPassword())){
                    if(newPassword.equals(newPasswordConfirmed)){
                        userEntity.setPassword(encryptedNewPassword);
                        userEntity = userRepository.save(userEntity);
                    }
                }else{
                    throw new CRUDException(AdminError.PASSWORD_DOESNT_MATCH.getLibelle());
                }
            }else{
                throw new CRUDException(AdminError.PASSWORD_EMPTY.getLibelle());
            }
        }
        return userEntity.getPassword().equals(encryptedNewPassword);
    }

    @Override
    public boolean disable(String formtoken, UserPayload userPayload) {
        Optional<UserEntity> userOpt = userRepository.findById(userPayload.getId());
        UserEntity userEntity = null;
        if(userOpt.isPresent()){
            userEntity = userOpt.get();
            userEntity.setActive(false);
            userEntity = userRepository.save(userEntity);
        }
        return (userEntity != null && userEntity.isActive()==false);
    }

    @Override
    public boolean deleteById(Integer id) {
        return false;
    }

    @Override
    public List<UserPayload> findAll() {
        return null;
    }


    @Override
    public UserPayload findByUsernameOrEmail(String usernameOrEmail) {
        Optional<UserEntity>   userEntityOptional = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
        return userEntityOptional.isPresent() ? mapper.entityToPayload(userEntityOptional.get(),true) : null;
    }

    @Override
    public UserPayload findById(Integer id) {
        Optional<UserEntity>   userEntityOptional = userRepository.findById(id);
        return userEntityOptional.isPresent() ? mapper.entityToPayload(userEntityOptional.get(),true) : null;
    }


    @Override
    public String getUsernameFromToken(String token) {
        String jwt;
        String usernameConnected = Strings.EMPTY;
        if (!token.isEmpty() && token.startsWith(BEARER)) {
            jwt = token.substring(7);
            usernameConnected = jwtService.extractUsername(jwt);
        }
        return usernameConnected;
    }

    @Override
    public Integer getUserIdFromToken(String token) {
        String connectedUsername = getUsernameFromToken(token);
        UserPayload user = findByUsernameOrEmail(connectedUsername);
        if(user!=null) {return user.getId();} else {return null;}
    }

    @Override
    public GlobalPayload<UserPayload> findByCriteria(UserCriteria criteria) {
        // Admin data - no store filtering
        return CommonUtil.fetchPage(
                entityManager,
                "UserEntity",
                criteria,
                criteria.toMap(),
                mapper,
                null,
                false  // Don't filter by store
        );
    }

    private String buildSearchAllQuery(String randomFieldValue){
        StringBuilder queryBuilder = new StringBuilder();
        queryBuilder.append("AND ( upper(user.username) like '%"+randomFieldValue.toUpperCase()+"%' OR ");
        queryBuilder.append(" upper(user.firstName) like '%"+randomFieldValue.toUpperCase()+"%' OR ");
        queryBuilder.append(" upper(user.lastName) like '%"+randomFieldValue.toUpperCase()+"%' OR ");
        queryBuilder.append(" upper(user.email) like '%"+randomFieldValue.toUpperCase()+"%' )");
        return queryBuilder.toString();
    }
}
