package com.mystore.manager.api.admin.service.impl;

import com.mystore.manager.api.admin.criteria.PosCriteria;
import com.mystore.manager.api.admin.mapper.PosMapper;
import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.admin.payload.PosPayload;
import com.mystore.manager.api.admin.repository.PosRepository;
import com.mystore.manager.api.admin.service.inter.IPosService;
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
public class PosService implements IPosService {

    private final PosRepository posRepository;
    private final PosMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public PosService(PosRepository posRepository, PosMapper mapper) {
        this.posRepository = posRepository;
        this.mapper = mapper;
    }

    @Override
    public PosPayload save(PosPayload payload) {
        PosEntity entity = mapper.payloadToEntity(payload, new PosEntity());
        return mapper.entityToPayload(posRepository.save(entity));
    }

    @Override
    public PosPayload edit(PosPayload payload) {
        Optional<PosEntity> entityOpt = posRepository.findById(payload.getId());
        if (entityOpt.isPresent()) {
            PosEntity entity = entityOpt.get();
            entity = mapper.payloadToEntity(payload, entity);
            return mapper.entityToPayload(posRepository.save(entity));
        }
        return null;
    }

    @Override
    public boolean deleteById(Integer id) {
        if (posRepository.existsById(id)) {
            posRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<PosPayload> findAll() {
        return posRepository.findAll().stream()
                .map(mapper::entityToPayload)
                .toList();
    }

    @Override
    public PosPayload findById(Integer id) {
        return posRepository.findById(id)
                .map(mapper::entityToPayload)
                .orElse(null);
    }

    @Override
    public PosPayload findByCode(String code) {
        return posRepository.findByCode(code)
                .map(mapper::entityToPayload)
                .orElse(null);
    }

    @Override
    public GlobalPayload<PosPayload> findByCriteria(PosCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<PosEntity> cq = cb.createQuery(PosEntity.class);
        Root<PosEntity> root = cq.from(PosEntity.class);

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
        Root<PosEntity> countRoot = countQuery.from(PosEntity.class);
        countQuery.select(cb.count(countRoot));
        countQuery.where(predicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        // Apply pagination
        List<PosEntity> entities = entityManager.createQuery(cq)
                .setFirstResult(criteria.getPages() * criteria.getSize())
                .setMaxResults(criteria.getSize())
                .getResultList();

        List<PosPayload> payloads = entities.stream()
                .map(mapper::entityToPayload)
                .toList();

        GlobalPayload<PosPayload> result = new GlobalPayload<>();
        result.setElements(payloads);
        result.setTotalNumberOfElements(total.intValue());
        return result;
    }
}
