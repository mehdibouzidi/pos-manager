package com.mystore.manager.api.business.common.mapper;

import com.mystore.manager.api.business.common.model.AbstractGlobalProduct;
import com.mystore.manager.api.business.common.payload.AbstractGlobalProductPayload;
import com.mystore.manager.api.business.repository.ProductRepository;
import com.mystore.manager.api.common.mapper.GlobalUserDateAuditMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class GlobalProductMapper {

    private ProductRepository productRepository;
    private ProductMapper productMapper;

    @Autowired
    public GlobalProductMapper(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public <T extends AbstractGlobalProductPayload, E extends AbstractGlobalProduct> E payloadToEntity(T payload, E entity) {
        entity = GlobalUserDateAuditMapper.payloadToEntity(payload, entity);
        if(Objects.nonNull(payload.getProduct())) entity.setProduct(productRepository.findByCode(payload.getProduct().getCode()));
        if(Objects.nonNull(payload.getQuantity())) entity.setQuantity(payload.getQuantity());
        return entity;
    }

    public <E extends AbstractGlobalProduct, T extends AbstractGlobalProductPayload> T entityToPayload(E entity, T payload) {
        payload = GlobalUserDateAuditMapper.entityToPayload(entity, payload);
        if(Objects.nonNull(entity.getProduct())) payload.setProduct(productMapper.entityToPayload(entity.getProduct(), false));
        if(Objects.nonNull(entity.getQuantity())) payload.setQuantity(entity.getQuantity());
        return payload;
    }
}
