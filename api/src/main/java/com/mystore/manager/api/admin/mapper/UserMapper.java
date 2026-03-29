package com.mystore.manager.api.admin.mapper;

import com.mystore.manager.api.admin.model.ProfilEntity;
import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.payload.MainUserPayload;
import com.mystore.manager.api.admin.payload.UserPayload;
import com.mystore.manager.api.admin.repository.ProfilRepository;
import com.mystore.manager.api.admin.repository.PosRepository;
import com.mystore.manager.api.common.mapper.GlobalDateAuditMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import com.mystore.manager.api.common.util.CommonUtil;
import io.jsonwebtoken.lang.Collections;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class UserMapper implements IMapper<UserPayload, UserEntity> {

    
    private ProfilRepository profilRepository;
    private ProfilMapper profilMapper;
    private PosRepository posRepository;

    private AdminAddressMapper addressMapper;


    @Autowired
    public UserMapper(ProfilRepository profilRepository, ProfilMapper profilMapper, AdminAddressMapper addressMapper, PosRepository posRepository) {
        this.profilRepository = profilRepository;
        this.profilMapper = profilMapper;
        this.addressMapper = addressMapper;
        this.posRepository = posRepository;
    }

    public UserEntity payloadToEntity(UserPayload payload, UserEntity entity) {
        entity = GlobalDateAuditMapper.payloadToEntity(payload, entity);
        if(!Strings.isEmpty(payload.getFirstName())) entity.setFirstName(payload.getFirstName());
        if(!Strings.isEmpty(payload.getLastName())) entity.setLastName(payload.getLastName());
        if(!Strings.isEmpty(payload.getPhoneNumber())) entity.setPhoneNumber(payload.getPhoneNumber());
        if(!Strings.isEmpty(payload.getEmail())) entity.setEmail(payload.getEmail());
//        if(Objects.nonNull(payload.getAddress())) entity.setAddress(addressMapper.payloadToEntity(payload.getAddress()));
        if(Objects.nonNull(payload.getPictureIn())) entity.setPicture(CommonUtil.multipartFileToBytes(payload.getPictureIn()));
        entity.setUsername(payload.getUsername());
        entity.setPassword(payload.getPassword());
        entity.setActive(payload.isActive());
        entity.setSuperAdmin(payload.isSuperAdmin());
        if(!Collections.isEmpty(payload.getProfils())){
            List<ProfilEntity> profils = payload.getProfils().stream().map(item -> profilRepository.findByCode(item.getCode())).toList();
            entity.setProfils(profils);
        }
        
        // Map pos
        if(Objects.nonNull(payload.getPosId())) {
            posRepository.findById(payload.getPosId()).ifPresent(entity::setPos);
        } else if(!Strings.isEmpty(payload.getPosCode())) {
            posRepository.findByCode(payload.getPosCode()).ifPresent(entity::setPos);
        }

        return entity;
    }


    public UserPayload entityToPayload(UserEntity entity, boolean detailed) {
        UserPayload payload = new UserPayload();
        if (Objects.nonNull(entity)) {
            payload = GlobalDateAuditMapper.entityToPayload(entity, payload);
            if(!Strings.isEmpty(entity.getFirstName())) payload.setFirstName(entity.getFirstName());
            if(!Strings.isEmpty(entity.getLastName())) payload.setLastName(entity.getLastName());
            if(!Strings.isEmpty(entity.getPhoneNumber())) payload.setPhoneNumber(entity.getPhoneNumber());
            if(!Strings.isEmpty(entity.getEmail())) payload.setEmail(entity.getEmail());
            //if(Objects.nonNull(entity.getAddress())) payload.setAddress(addressMapper.entityToPayload(entity.getAddress()));
            if(Objects.nonNull(entity.getPicture())) payload.setPicture(entity.getPicture());
            payload.setUsername(entity.getUsername());
            payload.setActive(entity.isActive());
            payload.setSuperAdmin(entity.isSuperAdmin());
            payload.setProfils(profilMapper.entityListToPayload(entity.getProfils(), detailed));
            
            // Map pos info
            if(Objects.nonNull(entity.getPos())) {
                PosEntity pos = entity.getPos();
                payload.setPosId(pos.getId());
                payload.setPosCode(pos.getCode());
                payload.setPosName(pos.getName());
            }
        }
        return payload;
    }

    public MainUserPayload entityToMainUserPayload(UserEntity entity){
        MainUserPayload payload = new MainUserPayload();
        payload.setUsername(entity.getUsername());
        payload.setPassword(entity.getPassword());
        payload.setActive(entity.isActive());

        List<GrantedAuthority> grantedAuthorities = entity.getProfils().stream()
                .filter(profil -> profil.getPrivileges() != null) // Ensure privileges are not null
                .flatMap(profil -> profil.getPrivileges().stream()) // Flatten privileges
                .map(privilege -> new SimpleGrantedAuthority(privilege.getAuthority())) // Map to SimpleGrantedAuthority
                .map(grantedAuthority -> (GrantedAuthority) grantedAuthority) // Explicitly cast to GrantedAuthority
                .distinct() // Ensure no duplicates
                .toList(); // Collect as a list

        payload.setAuthorities(grantedAuthorities);
        return payload;
    }
    @Override
    public List<UserPayload> entityListToPayload(List<UserEntity> entities, boolean detailed) {
        return Objects.isNull(entities) ? null : entities.stream().map(item -> entityToPayload(item, detailed)).toList();
    }
}
