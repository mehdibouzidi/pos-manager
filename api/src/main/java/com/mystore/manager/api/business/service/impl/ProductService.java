package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.business.common.criteria.ProductCriteria;
import com.mystore.manager.api.business.common.mapper.ProductMapper;
import com.mystore.manager.api.business.model.ProductEntity;
import com.mystore.manager.api.business.payload.ProductPayload;
import com.mystore.manager.api.common.context.StoreContext;
import com.mystore.manager.api.common.payload.GlobalPayload;
import com.mystore.manager.api.business.repository.ProductRepository;
import com.mystore.manager.api.common.util.CommonUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ProductService implements com.mystore.manager.api.business.service.inter.IProductService {

    private ProductRepository repository;
    private ProductMapper mapper;
    @PersistenceContext
    private EntityManager entityManager;

    public ProductService(ProductRepository repository, ProductMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public ProductPayload save(ProductPayload payload) {
        ProductEntity productEntity = mapper.payloadToEntity(payload, new ProductEntity());
        productEntity = repository.save(productEntity);
        return findById(productEntity.getId());
    }

    @Override
    public boolean delete(ProductPayload payload) {
        try {
            repository.delete(mapper.payloadToEntity(payload,null));
            return true;
        }catch (Exception e){
            return false;
        }
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
    public List<ProductPayload> deleteMultiple(List<ProductPayload> payloads) {
        List<ProductPayload> notDeleted = new ArrayList<>();
        for (ProductPayload payload : payloads) {
            if (!this.deleteById(payload.getId())) {
                notDeleted.add(payload);
            }
        }
        return notDeleted;
    }
    @Override
    public ProductPayload findById(Integer id) {
        return mapper.entityToPayload(getEntity(id),true);
    }

    @Override
    public ProductEntity getEntity(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public ProductEntity getByName(String name) {
        return repository.findByName(name);
    }

    @Override
    public ProductPayload update(ProductPayload payload) {
        ProductEntity entity = getEntity(payload.getId());
        if(entity!=null){
            entity = mapper.payloadToEntity(payload,entity);
            entity = repository.save(entity);
        }
        return mapper.entityToPayload(entity,true);
    }
    @Override
    public GlobalPayload<ProductPayload> findAllByCriteria(ProductCriteria criteria) {

        GlobalPayload<ProductPayload> result = CommonUtil.fetchPage(
                entityManager,
                "ProductEntity",
                criteria,
                criteria.toMap(),
                mapper,
                query -> {}
        );
        
        // Calculate and populate currentStock for each product
        if (result.getElements() != null && !result.getElements().isEmpty()) {
            populateCurrentStock(result.getElements());
        }
        
        return result;
    }
    
    private void populateCurrentStock(List<ProductPayload> products) {
        for (ProductPayload product : products) {
            product.setCurrentStock(BigDecimal.ZERO);
        }
    }

    @Override
    public List<ProductPayload> findAll() {
        List<ProductEntity> entities;
        if (StoreContext.isSuperAdmin()) {
            entities = repository.findAll();
        } else {
            Integer storeId = StoreContext.getStoreId();
            entities = storeId != null ? repository.findAllByStore_Id(storeId) : List.of();
        }
        return mapper.entityListToPayload(entities, false);
    }

    @Override
    public boolean uploadCsv(MultipartFile file) throws IOException {
        List<ProductEntity> products = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            reader.readLine(); // Skip header
            while ((line = reader.readLine()) != null) {
                String[] fields = line.split(";"); // Split using semicolon
                String code = fields[0];
                String name = fields[1];

                ProductEntity product = new ProductEntity();
                product.setCode(code);
                product.setName(name);
                products.add(product);
            }
            repository.saveAll(products);
            return true;
        } catch (Exception e) {
            throw e;
        }
    }


}
