package com.mystore.manager.api.business.service.inter;

import com.mystore.manager.api.business.common.criteria.ProductCategoryCriteria;
import com.mystore.manager.api.business.model.ProductCategoryEntity;
import com.mystore.manager.api.business.payload.ProductCategoryPayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

import java.util.List;

public interface IProductCategoryService {

    ProductCategoryPayload save(ProductCategoryPayload payload);

    ProductCategoryPayload update(ProductCategoryPayload payload);

    boolean deleteById(Integer id);

    ProductCategoryPayload findById(Integer id);

    ProductCategoryEntity getEntity(Integer id);

    List<ProductCategoryPayload> findAll();

    GlobalPayload<ProductCategoryPayload> findAllByCriteria(ProductCategoryCriteria criteria);
}
