package com.mystore.manager.api.business.common.mapper;

import com.mystore.manager.api.business.model.CaisseSessionEntity;
import com.mystore.manager.api.business.payload.CaisseSessionPayload;
import com.mystore.manager.api.common.mapper.GlobalUserDateAuditMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import com.mystore.manager.api.common.util.CommonUtil;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class CaisseSessionMapper implements IMapper<CaisseSessionPayload, CaisseSessionEntity> {

    public CaisseSessionEntity payloadToEntity(CaisseSessionPayload payload, CaisseSessionEntity entity) {
        if (entity == null) entity = new CaisseSessionEntity();
        entity = GlobalUserDateAuditMapper.payloadToEntity(payload, entity);
        if (Objects.nonNull(payload.getOpeningBalance())) entity.setOpeningBalance(new java.math.BigDecimal(payload.getOpeningBalance().toString()));
        if (Objects.nonNull(payload.getNotes())) entity.setNotes(payload.getNotes());
        return entity;
    }

    public CaisseSessionPayload entityToPayload(CaisseSessionEntity entity) {
        CaisseSessionPayload payload = new CaisseSessionPayload();
        if (Objects.nonNull(entity)) {
            payload = GlobalUserDateAuditMapper.entityToPayload(entity, payload);
            if (Objects.nonNull(entity.getOpenedAt())) payload.setOpenedAt(CommonUtil.instantToDateTime(entity.getOpenedAt()));
            if (Objects.nonNull(entity.getClosedAt())) payload.setClosedAt(CommonUtil.instantToDateTime(entity.getClosedAt()));
            if (Objects.nonNull(entity.getOpeningBalance())) payload.setOpeningBalance(entity.getOpeningBalance().doubleValue());
            if (Objects.nonNull(entity.getClosingBalance())) payload.setClosingBalance(entity.getClosingBalance().doubleValue());
            if (Objects.nonNull(entity.getTotalSalesAmount())) payload.setTotalSalesAmount(entity.getTotalSalesAmount().doubleValue());
            payload.setTotalSalesCount(entity.getTotalSalesCount());
            payload.setFirstOrderNumber(entity.getFirstOrderNumber());
            payload.setLastOrderNumber(entity.getLastOrderNumber());
            if (Objects.nonNull(entity.getVariance())) payload.setVariance(entity.getVariance().doubleValue());
            payload.setStatus(entity.getStatus());
            payload.setNotes(entity.getNotes());
        }
        return payload;
    }

    @Override
    public List<CaisseSessionPayload> entityListToPayload(List<CaisseSessionEntity> entities, boolean detailed) {
        if (entities == null) return List.of();
        return entities.stream().map(this::entityToPayload).toList();
    }
}
