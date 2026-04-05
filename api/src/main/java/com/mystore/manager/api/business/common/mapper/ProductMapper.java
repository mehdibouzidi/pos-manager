package com.mystore.manager.api.business.common.mapper;

import com.mystore.manager.api.business.model.ProductCategoryEntity;
import com.mystore.manager.api.business.model.ProductEntity;
import com.mystore.manager.api.business.payload.ProductPayload;
import com.mystore.manager.api.business.repository.ProductCategoryRepository;
import com.mystore.manager.api.common.mapper.BusinessGlobalDataMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.List;
import java.util.Objects;

@Component
public class ProductMapper implements IMapper<ProductPayload, ProductEntity> {

    @Autowired
    private ProductCategoryRepository categoryRepository;

    public ProductEntity payloadToEntity(ProductPayload payload, ProductEntity entity) {
        entity = BusinessGlobalDataMapper.payloadToEntity(payload, entity);
        if (Objects.nonNull(payload.getMaxStock()))       entity.setMaxStock(payload.getMaxStock());
        if (Objects.nonNull(payload.getMinStock()))       entity.setMinStock(payload.getMinStock());
        if (Objects.nonNull(payload.getWholesalePrice())) entity.setWholesalePrice(payload.getWholesalePrice());
        if (Objects.nonNull(payload.getRetailPrice()))    entity.setRetailPrice(payload.getRetailPrice());
        if (Objects.nonNull(payload.getCategoryId())) {
            ProductCategoryEntity category = categoryRepository.findById(payload.getCategoryId()).orElse(null);
            entity.setCategory(category);
        }
        if (Objects.nonNull(payload.getPhoto())) {
            entity.setPhoto(Base64.getDecoder().decode(payload.getPhoto()));
        }
        return entity;
    }

    public ProductPayload entityToPayload(ProductEntity entity, boolean detailed) {
        ProductPayload payload = new ProductPayload();
        if (Objects.nonNull(entity)) {
            payload = BusinessGlobalDataMapper.entityToPayload(entity, payload);
            payload.setMaxStock(entity.getMaxStock());
            payload.setMinStock(entity.getMinStock());
            payload.setWholesalePrice(entity.getWholesalePrice());
            payload.setRetailPrice(entity.getRetailPrice());
            if (Objects.nonNull(entity.getCurrentStock())) {
                payload.setCurrentStock(java.math.BigDecimal.valueOf(entity.getCurrentStock()));
            }
            if (Objects.nonNull(entity.getCategory())) {
                payload.setCategoryId(entity.getCategory().getId());
                payload.setCategoryName(entity.getCategory().getName());
            }
            if (Objects.nonNull(entity.getPhoto())) {
                payload.setPhoto(Base64.getEncoder().encodeToString(entity.getPhoto()));
            }
        }
        return payload;
    }


    @Override
    public List<ProductPayload> entityListToPayload(List<ProductEntity> entities, boolean detailed) {
        return Objects.isNull(entities) ? null : entities.stream().map(item -> entityToPayload(item, detailed)).toList();
    }
}
