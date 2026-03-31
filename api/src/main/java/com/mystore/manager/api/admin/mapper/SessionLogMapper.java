package com.mystore.manager.api.admin.mapper;

import com.mystore.manager.api.admin.model.SessionLogEntity;
import com.mystore.manager.api.admin.payload.SessionLogPayload;
import com.mystore.manager.api.common.mapper.IMapper;
import com.mystore.manager.api.common.util.CommonUtil;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class SessionLogMapper implements IMapper<SessionLogPayload, SessionLogEntity> {

    public SessionLogPayload entityToPayload(SessionLogEntity entity) {
        SessionLogPayload payload = new SessionLogPayload();
        if (Objects.nonNull(entity)) {
            payload.setId(entity.getId());
            if (Objects.nonNull(entity.getCreatedAt())) payload.setCreatedAt(CommonUtil.instantToDateTime(entity.getCreatedAt()));
            if (Objects.nonNull(entity.getUpdatedAt())) payload.setUpdatedAt(CommonUtil.instantToDateTime(entity.getUpdatedAt()));
            if (Objects.nonNull(entity.getLoginAt())) payload.setLoginAt(CommonUtil.instantToDateTime(entity.getLoginAt()));
            payload.setIpAddress(entity.getIpAddress());
            if (Objects.nonNull(entity.getUser())) {
                payload.setUserId(entity.getUser().getId());
                payload.setUserUsername(entity.getUser().getUsername());
                payload.setUserFullName(CommonUtil.composeFullName(entity.getUser().getFirstName(), entity.getUser().getLastName()));
            }
            if (Objects.nonNull(entity.getPos())) {
                payload.setPosId(entity.getPos().getId());
                payload.setPosCode(entity.getPos().getCode());
                payload.setPosName(entity.getPos().getName());
            }
        }
        return payload;
    }

    @Override
    public List<SessionLogPayload> entityListToPayload(List<SessionLogEntity> entities, boolean detailed) {
        if (entities == null) return List.of();
        return entities.stream().map(this::entityToPayload).toList();
    }
}
