package com.mystore.manager.api.admin.service.inter;

import com.mystore.manager.api.admin.criteria.UserCriteria;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.payload.ChangePasswordPayload;
import com.mystore.manager.api.admin.payload.UserPayload;
import com.mystore.manager.api.common.exception.CRUDException;
import com.mystore.manager.api.common.payload.GlobalPayload;

import java.util.List;

public interface IUserService {
    UserPayload save(UserPayload UserPayload);
    UserEntity saveEntity(UserEntity userEntity);
    UserPayload edit(UserPayload UserPayload, String token);

    boolean changePassword(ChangePasswordPayload requestDTO, String token) throws CRUDException;

    boolean disable(String formtoken, UserPayload userPayload);

    boolean deleteById(Integer id);
    List<UserPayload> findAll();
    UserPayload findByUsernameOrEmail(String usernameOrEmail);
    UserPayload findById(Integer id);
    String getUsernameFromToken(String token);
    Integer getUserIdFromToken(String token);

    GlobalPayload<UserPayload> findByCriteria(UserCriteria criteria);

}
