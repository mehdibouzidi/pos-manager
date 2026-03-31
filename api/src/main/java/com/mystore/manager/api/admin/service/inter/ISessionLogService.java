package com.mystore.manager.api.admin.service.inter;

import com.mystore.manager.api.admin.criteria.SessionLogCriteria;
import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.admin.model.SessionLogEntity;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.payload.SessionLogPayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

import java.util.List;

public interface ISessionLogService {
    SessionLogEntity recordLogin(UserEntity user, PosEntity pos, String ipAddress);
    SessionLogPayload findById(Integer id);
    List<SessionLogPayload> findAll();
    GlobalPayload<SessionLogPayload> findByCriteria(SessionLogCriteria criteria);
}
