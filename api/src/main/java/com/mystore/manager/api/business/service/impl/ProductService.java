package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.business.common.criteria.ProductCriteria;
import com.mystore.manager.api.business.common.mapper.ProductMapper;
import com.mystore.manager.api.business.model.ProductEntity;
import com.mystore.manager.api.business.payload.ProductPayload;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.payload.GlobalPayload;
import com.mystore.manager.api.business.repository.ProductRepository;
import com.mystore.manager.api.business.repository.StockMovementRepository;
import com.mystore.manager.api.common.util.CommonUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ProductService implements com.mystore.manager.api.business.service.inter.IProductService {

    private ProductRepository repository;
    private ProductMapper mapper;
    private StockMovementRepository stockMovementRepository;
    @PersistenceContext
    private EntityManager entityManager;

    public ProductService(ProductRepository repository, ProductMapper mapper, StockMovementRepository stockMovementRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.stockMovementRepository = stockMovementRepository;
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

        if (criteria.getDisplayedInPos() == null) {
            return CommonUtil.fetchPage(entityManager, "ProductEntity", criteria, criteria.toMap(), mapper, query -> {});
        }
        // Effective visibility in the till: the product AND its category (if any) must be displayed.
        // Subquery rather than en.category.displayedInPos, whose implicit inner join would drop products without category.
        String hiddenCategory = "EXISTS (SELECT c.id FROM ProductCategoryEntity c WHERE c = en.category AND c.displayedInPos = false)";
        String condition = criteria.getDisplayedInPos()
                ? "(en.displayedInPos = true AND NOT " + hiddenCategory + ")"
                : "(en.displayedInPos = false OR " + hiddenCategory + ")";
        String where = CommonUtil.appendConditions(
                CommonUtil.selectCritQueryBuilderWithoutSort("ProductEntity", criteria.toMap(), criteria, true),
                List.of(condition));
        return CommonUtil.fetchPage(entityManager, where + CommonUtil.getSort(criteria), CommonUtil.toCountQuery(where),
                criteria, mapper, query -> {});
    }
    
    @Override
    public List<ProductPayload> findAll() {
        return findAll(false);
    }

    @Override
    public List<ProductPayload> findAll(boolean displayedOnly) {
        if (displayedOnly) {
            return findAllForTill();
        }
        List<ProductEntity> entities;
        if (PosContext.isSuperAdmin()) {
            entities = repository.findAll(Sort.by("id"));
        } else {
            Integer posId = PosContext.getPosId();
            entities = posId != null ? repository.findAllByPos_IdOrderByIdAsc(posId) : List.of();
        }
        return mapper.entityListToPayload(entities, false);
    }

    /**
     * Till catalogue: shared by every POS, driven only by the "displayed in POS" flags
     * (a hidden category hides all its products). Stock is the one of the current POS.
     */
    private List<ProductPayload> findAllForTill() {
        List<ProductEntity> entities = repository.findAll(Sort.by("id")).stream()
                .filter(p -> p.isDisplayedInPos() && (p.getCategory() == null || p.getCategory().isDisplayedInPos()))
                .toList();
        List<ProductPayload> payloads = mapper.entityListToPayload(entities, false);

        Integer posId = PosContext.getPosId();
        if (posId == null) return payloads;

        // product.currentStock is the total over all POS. The stock of one POS is what its own movements made;
        // the POS that created the product also keeps whatever stock predates the movements.
        Map<Integer, Double> own = toMap(stockMovementRepository.sumByProductForPos(posId));
        Map<Integer, Double> others = toMap(stockMovementRepository.sumByProductForOtherPos(posId));
        for (int i = 0; i < entities.size(); i++) {
            ProductEntity product = entities.get(i);
            boolean createdHere = product.getPos() != null && posId.equals(product.getPos().getId());
            double stock = createdHere
                    ? (product.getCurrentStock() != null ? product.getCurrentStock() : 0) - others.getOrDefault(product.getId(), 0.0)
                    : own.getOrDefault(product.getId(), 0.0);
            payloads.get(i).setCurrentStock(BigDecimal.valueOf(stock));
        }
        return payloads;
    }

    private static Map<Integer, Double> toMap(List<Object[]> rows) {
        Map<Integer, Double> result = new HashMap<>();
        for (Object[] row : rows) {
            if (row[0] != null && row[1] != null) result.put(((Number) row[0]).intValue(), ((Number) row[1]).doubleValue());
        }
        return result;
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
