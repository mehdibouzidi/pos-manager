package com.mystore.manager.api.admin.mapper;

import com.mystore.manager.api.admin.model.AdminAddressEntity;
import com.mystore.manager.api.admin.payload.AdminAddressPayload;
import com.mystore.manager.api.common.mapper.GlobalUserDateAuditMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import com.mystore.manager.api.common.util.CommonUtil;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class AdminAddressMapper implements IMapper<AdminAddressPayload, AdminAddressEntity> {

    public AdminAddressEntity payloadToEntity(AdminAddressPayload payload) {
        AdminAddressEntity entity = new AdminAddressEntity();
        entity = GlobalUserDateAuditMapper.payloadToEntityAdmin(payload, entity);
        if (Objects.nonNull(payload)) {
            if (Objects.nonNull(payload.getAddress())) entity.setAddress(payload.getAddress());
            if (Objects.nonNull(payload.getCity())) entity.setCity(payload.getCity());
            if (Objects.nonNull(payload.getTown())) entity.setTown(payload.getTown());
            if (Objects.nonNull(payload.getCountry())) entity.setCountry(payload.getCountry());
            if (Objects.nonNull(payload.getPostalCode())) entity.setPostalCode(payload.getPostalCode());
            if (Objects.nonNull(payload.getLatitude())) entity.setLatitude(payload.getLatitude());
            if (Objects.nonNull(payload.getLongitude())) entity.setLongitude(payload.getLongitude());
        }
        return entity;
    }

    public AdminAddressPayload entityToPayload(AdminAddressEntity entity) {
        AdminAddressPayload payload = new AdminAddressPayload();
        if(Objects.nonNull(entity.getId())) payload.setId(entity.getId());
        if(Objects.nonNull(entity.getCreatedAt())) payload.setCreatedAt(CommonUtil.instantToDateTime(entity.getCreatedAt()));
        if(Objects.nonNull(entity.getUpdatedAt())) payload.setUpdatedAt(CommonUtil.instantToDateTime(entity.getUpdatedAt()));
        if (Objects.nonNull(entity)) {
            if (Objects.nonNull(entity.getAddress())) payload.setAddress(entity.getAddress());
            if (Objects.nonNull(entity.getCity())) payload.setCity(entity.getCity());
            if (Objects.nonNull(entity.getTown())) payload.setTown(entity.getTown());
            if (Objects.nonNull(entity.getCountry())) payload.setCountry(entity.getCountry());
            if (Objects.nonNull(entity.getPostalCode())) payload.setPostalCode(entity.getPostalCode());
            if (Objects.nonNull(entity.getLatitude())) payload.setLatitude(entity.getLatitude());
            if (Objects.nonNull(entity.getLongitude())) payload.setLongitude(entity.getLongitude());
        }

        return payload;
    }

    public AdminAddressEntity entityUpdateFromPayload(AdminAddressEntity entity, AdminAddressPayload payload) {
        entity = GlobalUserDateAuditMapper.payloadToEntityAdmin(payload, entity);

        if (Objects.nonNull(payload)) {
            if (Objects.nonNull(payload.getAddress()))
                entity.setAddress(payload.getAddress().equals(entity.getAddress()) ? entity.getAddress() : payload.getAddress());

            if (Objects.nonNull(payload.getCity()))
                entity.setCity(payload.getCity().equals(entity.getCity()) ? entity.getCity() : payload.getCity());

            if (Objects.nonNull(payload.getTown()))
                entity.setTown(payload.getTown().equals(entity.getTown()) ? entity.getTown() : payload.getTown());

            if (Objects.nonNull(payload.getCountry()))
                entity.setCountry(payload.getCountry().equals(entity.getCountry()) ? entity.getCountry() : payload.getCountry());

            if (Objects.nonNull(payload.getPostalCode()))
                entity.setPostalCode(payload.getPostalCode().equals(entity.getPostalCode()) ? entity.getPostalCode() : payload.getPostalCode());

            if (Objects.nonNull(payload.getLatitude()))
                entity.setLatitude(payload.getLatitude().equals(entity.getLatitude()) ? entity.getLatitude() : payload.getLatitude());

            if (Objects.nonNull(payload.getLongitude()))
                entity.setLongitude(payload.getLongitude().equals(entity.getLongitude()) ? entity.getLongitude() : payload.getLongitude());

        }
        return entity;
    }

    @Override
    public List<AdminAddressPayload> entityListToPayload(List<AdminAddressEntity> entities, boolean detailed) {
        return Objects.isNull(entities) ? null : entities.stream().map(this::entityToPayload).toList();
    }
}
