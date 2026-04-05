package com.mystore.manager.api.business.common.mapper;

import com.mystore.manager.api.business.model.StockMovementEntity;
import com.mystore.manager.api.business.payload.StockMovementPayload;
import com.mystore.manager.api.common.mapper.GlobalUserDateAuditMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import com.mystore.manager.api.common.util.CommonUtil;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Component
public class StockMovementMapper implements IMapper<StockMovementPayload, StockMovementEntity> {

    public StockMovementEntity payloadToEntity(StockMovementPayload payload, StockMovementEntity entity) {
        if (entity == null) entity = new StockMovementEntity();
        entity = GlobalUserDateAuditMapper.payloadToEntity(payload, entity);
        if (Objects.nonNull(payload.getMovementType())) entity.setMovementType(payload.getMovementType());
        if (Objects.nonNull(payload.getQuantity())) entity.setQuantity(payload.getQuantity());
        if (Objects.nonNull(payload.getReason())) entity.setReason(payload.getReason());
        if (entity.getMovementDate() == null) entity.setMovementDate(Instant.now());
        return entity;
    }

    public StockMovementPayload entityToPayload(StockMovementEntity entity) {
        StockMovementPayload payload = new StockMovementPayload();
        if (Objects.nonNull(entity)) {
            payload = GlobalUserDateAuditMapper.entityToPayload(entity, payload);
            payload.setMovementType(entity.getMovementType());
            payload.setQuantity(entity.getQuantity());
            payload.setReason(entity.getReason());
            if (Objects.nonNull(entity.getMovementDate())) payload.setMovementDate(CommonUtil.instantToDateTime(entity.getMovementDate()));
            if (Objects.nonNull(entity.getProduct())) {
                payload.setProductId(entity.getProduct().getId());
                payload.setProductCode(entity.getProduct().getCode());
                payload.setProductName(entity.getProduct().getName());
                if (Objects.nonNull(entity.getProduct().getCategory())) {
                    payload.setCategoryId(entity.getProduct().getCategory().getId());
                    payload.setCategoryName(entity.getProduct().getCategory().getName());
                }
            }
        }
        return payload;
    }

    @Override
    public List<StockMovementPayload> entityListToPayload(List<StockMovementEntity> entities, boolean detailed) {
        if (entities == null) return List.of();
        return entities.stream().map(this::entityToPayload).toList();
    }
}
