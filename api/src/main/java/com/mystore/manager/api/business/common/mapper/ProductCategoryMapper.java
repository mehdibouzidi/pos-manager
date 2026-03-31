package com.mystore.manager.api.business.common.mapper;

import com.mystore.manager.api.business.model.ProductCategoryEntity;
import com.mystore.manager.api.business.payload.ProductCategoryPayload;
import com.mystore.manager.api.common.mapper.BusinessGlobalDataMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.List;
import java.util.Objects;

@Component
public class ProductCategoryMapper implements IMapper<ProductCategoryPayload, ProductCategoryEntity> {

    public ProductCategoryEntity payloadToEntity(ProductCategoryPayload payload, ProductCategoryEntity entity) {
        if (entity == null) entity = new ProductCategoryEntity();
        entity = BusinessGlobalDataMapper.payloadToEntity(payload, entity);
        if (Objects.nonNull(payload.getPhoto())) {
            entity.setPhoto(Base64.getDecoder().decode(payload.getPhoto()));
        }
        return entity;
    }

    public ProductCategoryPayload entityToPayload(ProductCategoryEntity entity, boolean detailed) {
        ProductCategoryPayload payload = new ProductCategoryPayload();
        if (Objects.nonNull(entity)) {
            payload = BusinessGlobalDataMapper.entityToPayload(entity, payload);
            if (Objects.nonNull(entity.getPhoto())) {
                payload.setPhoto(Base64.getEncoder().encodeToString(entity.getPhoto()));
            }
        }
        return payload;
    }

    @Override
    public List<ProductCategoryPayload> entityListToPayload(List<ProductCategoryEntity> entities, boolean detailed) {
        return Objects.isNull(entities) ? null : entities.stream()
                .map(item -> entityToPayload(item, detailed)).toList();
    }
}
