package com.mystore.manager.api.business.common.mapper;

import com.mystore.manager.api.business.model.ProductEntity;
import com.mystore.manager.api.business.payload.ProductPayload;
import com.mystore.manager.api.common.mapper.BusinessGlobalDataMapper;
import com.mystore.manager.api.common.mapper.IMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class ProductMapper implements IMapper<ProductPayload, ProductEntity> {

    public ProductEntity payloadToEntity(ProductPayload payload, ProductEntity entity) {
        entity = BusinessGlobalDataMapper.payloadToEntity(payload, entity);
          if(Objects.nonNull(payload.getMaxStock())) entity.setMaxStock(payload.getMaxStock());
          if(Objects.nonNull(payload.getMinStock())) entity.setMinStock(payload.getMinStock());
          if(Objects.nonNull(payload.getWholesalePrice())) entity.setWholesalePrice(payload.getWholesalePrice());
          if(Objects.nonNull(payload.getRetailPrice())) entity.setRetailPrice(payload.getRetailPrice());
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
        }
        return payload;
    }


    @Override
    public List<ProductPayload> entityListToPayload(List<ProductEntity> entities, boolean detailed) {
        return Objects.isNull(entities) ? null : entities.stream().map(item -> entityToPayload(item, detailed)).toList();
    }
}
