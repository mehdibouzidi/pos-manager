package com.mystore.manager.api.admin.service.impl;

import com.mystore.manager.api.admin.criteria.StoreCriteria;
import com.mystore.manager.api.admin.mapper.StoreMapper;
import com.mystore.manager.api.admin.model.StoreEntity;
import com.mystore.manager.api.admin.payload.StorePayload;
import com.mystore.manager.api.admin.repository.StoreRepository;
import com.mystore.manager.api.admin.service.inter.IStoreService;
import com.mystore.manager.api.common.payload.GlobalPayload;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StoreService implements IStoreService {

    private final StoreRepository storeRepository;
    private final StoreMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public StoreService(StoreRepository storeRepository, StoreMapper mapper) {
        this.storeRepository = storeRepository;
        this.mapper = mapper;
    }

    @Override
    public StorePayload save(StorePayload payload) {
        StoreEntity entity = mapper.payloadToEntity(payload, new StoreEntity());
        return mapper.entityToPayload(storeRepository.save(entity));
    }

    @Override
    public StorePayload edit(StorePayload payload) {
        Optional<StoreEntity> entityOpt = storeRepository.findById(payload.getId());
        if (entityOpt.isPresent()) {
            StoreEntity entity = entityOpt.get();
            entity = mapper.payloadToEntity(payload, entity);
            return mapper.entityToPayload(storeRepository.save(entity));
        }
        return null;
    }

    @Override
    public boolean deleteById(Integer id) {
        if (storeRepository.existsById(id)) {
            storeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<StorePayload> findAll() {
        return storeRepository.findAll().stream()
                .map(mapper::entityToPayload)
                .toList();
    }

    @Override
    public StorePayload findById(Integer id) {
        return storeRepository.findById(id)
                .map(mapper::entityToPayload)
                .orElse(null);
    }

    @Override
    public StorePayload findByCode(String code) {
        return storeRepository.findByCode(code)
                .map(mapper::entityToPayload)
                .orElse(null);
    }

    @Override
    public GlobalPayload<StorePayload> findByCriteria(StoreCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<StoreEntity> cq = cb.createQuery(StoreEntity.class);
        Root<StoreEntity> root = cq.from(StoreEntity.class);

        List<Predicate> predicates = new ArrayList<>();

        if (criteria.getId() != null) {
            predicates.add(cb.equal(root.get("id"), criteria.getId()));
        }
        if (criteria.getCode() != null && !criteria.getCode().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("code")), "%" + criteria.getCode().toLowerCase() + "%"));
        }
        if (criteria.getName() != null && !criteria.getName().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("name")), "%" + criteria.getName().toLowerCase() + "%"));
        }
        if (criteria.getActive() != null) {
            predicates.add(cb.equal(root.get("active"), criteria.getActive()));
        }

        cq.where(predicates.toArray(new Predicate[0]));

        // Count query
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<StoreEntity> countRoot = countQuery.from(StoreEntity.class);
        countQuery.select(cb.count(countRoot));
        countQuery.where(predicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        // Apply pagination
        List<StoreEntity> entities = entityManager.createQuery(cq)
                .setFirstResult(criteria.getPages() * criteria.getSize())
                .setMaxResults(criteria.getSize())
                .getResultList();

        List<StorePayload> payloads = entities.stream()
                .map(mapper::entityToPayload)
                .toList();

        GlobalPayload<StorePayload> result = new GlobalPayload<>();
        result.setElements(payloads);
        result.setTotalNumberOfElements(total.intValue());
        return result;
    }
}
