package com.mystore.manager.api.admin.service.impl;

import com.mystore.manager.api.admin.criteria.ApiKeyCriteria;
import com.mystore.manager.api.admin.mapper.ApiKeyMapper;
import com.mystore.manager.api.admin.model.ApiKeyEntity;
import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.admin.payload.ApiKeyPayload;
import com.mystore.manager.api.admin.repository.ApiKeyRepository;
import com.mystore.manager.api.admin.repository.PosRepository;
import com.mystore.manager.api.admin.service.inter.IApiKeyService;
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
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class ApiKeyService implements IApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final PosRepository posRepository;
    private final ApiKeyMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public ApiKeyService(ApiKeyRepository apiKeyRepository, PosRepository posRepository, ApiKeyMapper mapper) {
        this.apiKeyRepository = apiKeyRepository;
        this.posRepository = posRepository;
        this.mapper = mapper;
    }

    @Override
    public ApiKeyPayload save(ApiKeyPayload payload) {
        ApiKeyEntity entity = new ApiKeyEntity();
        entity = mapper.payloadToEntity(payload, entity);
        entity.setKeyValue(UUID.randomUUID().toString().replace("-", "").toUpperCase());
        if (Objects.nonNull(payload.getPosId())) {
            posRepository.findById(payload.getPosId()).ifPresent(entity::setPos);
        }
        return mapper.entityToPayload(apiKeyRepository.save(entity));
    }

    @Override
    public ApiKeyPayload edit(ApiKeyPayload payload) {
        Optional<ApiKeyEntity> entityOpt = apiKeyRepository.findById(payload.getId());
        if (entityOpt.isPresent()) {
            ApiKeyEntity entity = entityOpt.get();
            entity = mapper.payloadToEntity(payload, entity);
            if (Objects.nonNull(payload.getPosId())) {
                posRepository.findById(payload.getPosId()).ifPresent(entity::setPos);
            }
            return mapper.entityToPayload(apiKeyRepository.save(entity));
        }
        return null;
    }

    @Override
    public ApiKeyPayload regenerate(Integer id) {
        Optional<ApiKeyEntity> entityOpt = apiKeyRepository.findById(id);
        if (entityOpt.isPresent()) {
            ApiKeyEntity entity = entityOpt.get();
            entity.setKeyValue(UUID.randomUUID().toString().replace("-", "").toUpperCase());
            return mapper.entityToPayload(apiKeyRepository.save(entity));
        }
        return null;
    }

    @Override
    public boolean deleteById(Integer id) {
        if (apiKeyRepository.existsById(id)) {
            apiKeyRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public ApiKeyPayload findById(Integer id) {
        return apiKeyRepository.findById(id)
                .map(mapper::entityToPayload)
                .orElse(null);
    }

    @Override
    public ApiKeyPayload findActiveByPosId(Integer posId) {
        return apiKeyRepository.findAllByPos_Id(posId).stream()
                .filter(ApiKeyEntity::isActive)
                .findFirst()
                .map(mapper::entityToPayload)
                .orElse(null);
    }

    @Override
    public List<ApiKeyPayload> findAll() {
        return mapper.entityListToPayload(apiKeyRepository.findAll(), false);
    }

    @Override
    public GlobalPayload<ApiKeyPayload> findByCriteria(ApiKeyCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<ApiKeyEntity> cq = cb.createQuery(ApiKeyEntity.class);
        Root<ApiKeyEntity> root = cq.from(ApiKeyEntity.class);

        List<Predicate> predicates = new ArrayList<>();

        if (criteria.getId() != null) {
            predicates.add(cb.equal(root.get("id"), criteria.getId()));
        }
        if (criteria.getPosId() != null) {
            predicates.add(cb.equal(root.get("pos").get("id"), criteria.getPosId()));
        }
        if (criteria.getDescription() != null && !criteria.getDescription().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("description")), "%" + criteria.getDescription().toLowerCase() + "%"));
        }
        if (criteria.getActive() != null) {
            predicates.add(cb.equal(root.get("active"), criteria.getActive()));
        }

        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.desc(root.get("createdAt")));

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<ApiKeyEntity> countRoot = countQuery.from(ApiKeyEntity.class);
        countQuery.select(cb.count(countRoot));

        List<Predicate> countPredicates = new ArrayList<>(predicates.size());
        if (criteria.getId() != null) countPredicates.add(cb.equal(countRoot.get("id"), criteria.getId()));
        if (criteria.getPosId() != null) {
            countPredicates.add(cb.equal(countRoot.get("pos").get("id"), criteria.getPosId()));
        }
        if (criteria.getDescription() != null && !criteria.getDescription().isEmpty()) {
            countPredicates.add(cb.like(cb.lower(countRoot.get("description")), "%" + criteria.getDescription().toLowerCase() + "%"));
        }
        if (criteria.getActive() != null) countPredicates.add(cb.equal(countRoot.get("active"), criteria.getActive()));

        countQuery.where(countPredicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ApiKeyEntity> entities = entityManager.createQuery(cq)
                .setFirstResult(criteria.getPages() * criteria.getSize())
                .setMaxResults(criteria.getSize())
                .getResultList();

        GlobalPayload<ApiKeyPayload> result = new GlobalPayload<>();
        result.setElements(mapper.entityListToPayload(entities, false));
        result.setTotalNumberOfElements(total.intValue());
        return result;
    }
}
