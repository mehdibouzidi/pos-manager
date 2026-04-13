package com.mystore.manager.api.business.common.mapper;

import com.mystore.manager.api.business.model.SaleEntity;
import com.mystore.manager.api.business.model.SaleItemEntity;
import com.mystore.manager.api.business.payload.SaleItemPayload;
import com.mystore.manager.api.business.payload.SalePayload;
import com.mystore.manager.api.common.mapper.GlobalUserDateAuditMapper;
import com.mystore.manager.api.common.util.CommonUtil;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class SaleMapper {

    public SaleEntity payloadToEntity(SalePayload payload, SaleEntity entity) {
        if (entity == null) entity = new SaleEntity();
        entity = GlobalUserDateAuditMapper.payloadToEntity(payload, entity);
        if (Objects.nonNull(payload.getTotalAmount())) entity.setTotalAmount(payload.getTotalAmount());
        if (Objects.nonNull(payload.getPaymentMethod())) entity.setPaymentMethod(payload.getPaymentMethod());
        return entity;
    }

    public SalePayload entityToPayload(SaleEntity entity) {
        SalePayload payload = new SalePayload();
        if (Objects.nonNull(entity)) {
            payload = GlobalUserDateAuditMapper.entityToPayload(entity, payload);
            payload.setOrderNumber(entity.getOrderNumber());
            if (Objects.nonNull(entity.getSaleDate())) {
                payload.setSaleDate(CommonUtil.instantToDateTime(entity.getSaleDate()));
            }
            payload.setTotalAmount(entity.getTotalAmount());
            payload.setPaymentMethod(entity.getPaymentMethod());
            if (Objects.nonNull(entity.getItems())) {
                payload.setItems(entity.getItems().stream()
                        .map(this::itemEntityToPayload)
                        .collect(Collectors.toList()));
            }
        }
        return payload;
    }

    public SaleItemPayload itemEntityToPayload(SaleItemEntity item) {
        SaleItemPayload p = new SaleItemPayload();
        p.setQuantity(item.getQuantity());
        p.setUnitPrice(item.getUnitPrice());
        if (Objects.nonNull(item.getUnitPrice()) && Objects.nonNull(item.getQuantity())) {
            p.setTotalPrice(item.getUnitPrice() * item.getQuantity());
        }
        if (Objects.nonNull(item.getProduct())) {
            p.setProductId(item.getProduct().getId());
            p.setProductCode(item.getProduct().getCode());
            p.setProductName(item.getProduct().getName());
        }
        return p;
    }

    public List<SalePayload> entityListToPayload(List<SaleEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::entityToPayload).collect(Collectors.toList());
    }
}
