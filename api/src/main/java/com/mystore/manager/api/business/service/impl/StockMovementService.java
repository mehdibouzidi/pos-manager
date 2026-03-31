package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.business.common.criteria.StockMovementCriteria;
import com.mystore.manager.api.business.common.mapper.StockMovementMapper;
import com.mystore.manager.api.business.model.ProductEntity;
import com.mystore.manager.api.business.model.StockMovementEntity;
import com.mystore.manager.api.business.payload.StockMovementPayload;
import com.mystore.manager.api.business.repository.ProductRepository;
import com.mystore.manager.api.business.repository.StockMovementRepository;
import com.mystore.manager.api.business.service.inter.IStockMovementService;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.payload.GlobalPayload;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class StockMovementService implements IStockMovementService {

    private final StockMovementRepository repository;
    private final ProductRepository productRepository;
    private final StockMovementMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public StockMovementService(StockMovementRepository repository, ProductRepository productRepository, StockMovementMapper mapper) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public StockMovementPayload save(StockMovementPayload payload) {
        StockMovementEntity entity = mapper.payloadToEntity(payload, new StockMovementEntity());
        if (Objects.nonNull(payload.getProductId())) {
            Optional<ProductEntity> productOpt = productRepository.findById(payload.getProductId());
            if (productOpt.isPresent()) {
                ProductEntity product = productOpt.get();
                entity.setProduct(product);
                updateProductStock(product, payload.getMovementType(), payload.getQuantity());
            }
        }
        entity = repository.save(entity);
        return mapper.entityToPayload(entity);
    }

    @Override
    @Transactional
    public StockMovementPayload update(StockMovementPayload payload) {
        Optional<StockMovementEntity> entityOpt = repository.findById(payload.getId());
        if (entityOpt.isPresent()) {
            StockMovementEntity entity = entityOpt.get();
            entity = mapper.payloadToEntity(payload, entity);
            entity = repository.save(entity);
            return mapper.entityToPayload(entity);
        }
        return null;
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
    public StockMovementPayload findById(Integer id) {
        return repository.findById(id)
                .map(mapper::entityToPayload)
                .orElse(null);
    }

    @Override
    public List<StockMovementPayload> findAll() {
        List<StockMovementEntity> entities;
        if (PosContext.isSuperAdmin()) {
            entities = repository.findAll();
        } else {
            Integer posId = PosContext.getPosId();
            entities = posId != null ? repository.findAllByPos_Id(posId) : List.of();
        }
        return mapper.entityListToPayload(entities, false);
    }

    @Override
    public GlobalPayload<StockMovementPayload> findAllByCriteria(StockMovementCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<StockMovementEntity> cq = cb.createQuery(StockMovementEntity.class);
        Root<StockMovementEntity> root = cq.from(StockMovementEntity.class);

        List<Predicate> predicates = buildPredicates(cb, root, criteria);
        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.desc(root.get("createdAt")));

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<StockMovementEntity> countRoot = countQuery.from(StockMovementEntity.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, criteria);
        countQuery.select(cb.count(countRoot));
        countQuery.where(countPredicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        List<StockMovementEntity> entities = entityManager.createQuery(cq)
                .setFirstResult(criteria.getPages() * criteria.getSize())
                .setMaxResults(criteria.getSize())
                .getResultList();

        GlobalPayload<StockMovementPayload> result = new GlobalPayload<>();
        result.setElements(mapper.entityListToPayload(entities, false));
        result.setTotalNumberOfElements(total.intValue());
        return result;
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<StockMovementEntity> root, StockMovementCriteria criteria) {
        List<Predicate> predicates = new ArrayList<>();
        if (criteria.getId() != null) predicates.add(cb.equal(root.get("id"), criteria.getId()));
        if (criteria.getProductId() != null) predicates.add(cb.equal(root.get("product").get("id"), criteria.getProductId()));
        if (criteria.getPosId() != null) {
            predicates.add(cb.equal(root.get("pos").get("id"), criteria.getPosId()));
        } else if (!PosContext.isSuperAdmin()) {
            Integer posId = PosContext.getPosId();
            if (posId != null) predicates.add(cb.equal(root.get("pos").get("id"), posId));
        }
        if (criteria.getMovementType() != null && !criteria.getMovementType().isEmpty()) {
            predicates.add(cb.equal(root.get("movementType"), criteria.getMovementType().toUpperCase()));
        }
        if (criteria.getReason() != null && !criteria.getReason().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("reason")), "%" + criteria.getReason().toLowerCase() + "%"));
        }
        return predicates;
    }

    private void updateProductStock(ProductEntity product, String movementType, Double quantity) {
        if (movementType == null || quantity == null) return;
        Double current = Objects.requireNonNullElse(product.getCurrentStock(), 0.0);
        switch (movementType.toUpperCase()) {
            case "ENTRY" -> product.setCurrentStock(current + quantity);
            case "EXIT"  -> product.setCurrentStock(current - quantity);
            case "ADJUSTMENT" -> product.setCurrentStock(quantity);
        }
        productRepository.save(product);
    }
}
