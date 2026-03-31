package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.business.common.criteria.ProductCategoryCriteria;
import com.mystore.manager.api.business.common.mapper.ProductCategoryMapper;
import com.mystore.manager.api.business.model.ProductCategoryEntity;
import com.mystore.manager.api.business.payload.ProductCategoryPayload;
import com.mystore.manager.api.business.repository.ProductCategoryRepository;
import com.mystore.manager.api.business.service.inter.IProductCategoryService;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.payload.GlobalPayload;
import com.mystore.manager.api.common.util.CommonUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class ProductCategoryService implements IProductCategoryService {

    private final ProductCategoryRepository repository;
    private final ProductCategoryMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    public ProductCategoryService(ProductCategoryRepository repository, ProductCategoryMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public ProductCategoryPayload save(ProductCategoryPayload payload) {
        ProductCategoryEntity entity = mapper.payloadToEntity(payload, new ProductCategoryEntity());
        entity = repository.save(entity);
        return findById(entity.getId());
    }

    @Override
    @Transactional
    public ProductCategoryPayload update(ProductCategoryPayload payload) {
        ProductCategoryEntity entity = getEntity(payload.getId());
        if (entity != null) {
            entity = mapper.payloadToEntity(payload, entity);
            entity = repository.save(entity);
        }
        return mapper.entityToPayload(entity, true);
    }

    @Override
    @Transactional
    public boolean deleteById(Integer id) {
        try {
            repository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public ProductCategoryPayload findById(Integer id) {
        return mapper.entityToPayload(getEntity(id), true);
    }

    @Override
    public ProductCategoryEntity getEntity(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public List<ProductCategoryPayload> findAll() {
        List<ProductCategoryEntity> entities;
        if (PosContext.isSuperAdmin()) {
            entities = repository.findAll();
        } else {
            Integer posId = PosContext.getPosId();
            entities = posId != null ? repository.findAllByPos_Id(posId) : List.of();
        }
        return mapper.entityListToPayload(entities, false);
    }

    @Override
    public GlobalPayload<ProductCategoryPayload> findAllByCriteria(ProductCategoryCriteria criteria) {
        return CommonUtil.fetchPage(
                entityManager,
                "ProductCategoryEntity",
                criteria,
                criteria.toMap(),
                mapper,
                query -> {}
        );
    }
}
