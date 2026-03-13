package com.mystore.manager.api.admin.mapper;

import com.mystore.manager.api.admin.model.PrivilegeEntity;
import com.mystore.manager.api.admin.model.ProfilEntity;
import com.mystore.manager.api.admin.payload.ProfilPayload;
import com.mystore.manager.api.common.mapper.GlobalAuditMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class ProfilMapper implements IMapper<ProfilPayload, ProfilEntity> {

    private final PrivilegeMapper privilegeMapper;

    @Autowired
    public ProfilMapper(PrivilegeMapper privilegeMapper) {
        this.privilegeMapper = privilegeMapper;
    }

    public ProfilEntity payloadToEntity(ProfilPayload payload){
        ProfilEntity entity = new ProfilEntity();
        entity = GlobalAuditMapper.payloadToEntity(payload, entity);

        if (Objects.nonNull(payload.getPrivileges())) {
            entity.setPrivileges(payload.getPrivileges().stream()
                    .filter(item -> Objects.nonNull(item) && Objects.nonNull(item.getId()))
                    .map(item -> {
                        PrivilegeEntity privilege = new PrivilegeEntity();
                        privilege.setId(item.getId());
                        return privilege;
                    })
                    .toList());
        }
        return entity;
    }

    public ProfilPayload entityToPayload(ProfilEntity entity){
        ProfilPayload payload = new ProfilPayload();
        if (Objects.nonNull(entity)) {
            payload = GlobalAuditMapper.entityToPayload(entity, payload);
            if (Objects.nonNull(entity.getPrivileges())) {
                payload.setPrivileges(entity.getPrivileges().stream().map(privilegeMapper::entityToPayload).toList());
            }
        }
        return payload;
    }
    @Override
    public List<ProfilPayload> entityListToPayload(List<ProfilEntity> entities, boolean detailed) {
        return Objects.isNull(entities) ? null : entities.stream().map(this::entityToPayload).toList();
    }
}
