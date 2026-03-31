package com.mystore.manager.api.admin.service.impl;

import com.mystore.manager.api.admin.criteria.SessionLogCriteria;
import com.mystore.manager.api.admin.mapper.SessionLogMapper;
import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.admin.model.SessionLogEntity;
import com.mystore.manager.api.admin.model.UserEntity;
import com.mystore.manager.api.admin.payload.SessionLogPayload;
import com.mystore.manager.api.admin.repository.SessionLogRepository;
import com.mystore.manager.api.admin.service.inter.ISessionLogService;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.payload.GlobalPayload;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class SessionLogService implements ISessionLogService {

    private final SessionLogRepository repository;
    private final SessionLogMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public SessionLogService(SessionLogRepository repository, SessionLogMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public SessionLogEntity recordLogin(UserEntity user, PosEntity pos, String ipAddress) {
        SessionLogEntity entity = new SessionLogEntity();
        entity.setUser(user);
        entity.setPos(pos);
        entity.setIpAddress(ipAddress);
        entity.setLoginAt(Instant.now());
        return repository.save(entity);
    }

    @Override
    public SessionLogPayload findById(Integer id) {
        return repository.findById(id)
                .map(mapper::entityToPayload)
                .orElse(null);
    }

    @Override
    public List<SessionLogPayload> findAll() {
        List<SessionLogEntity> entities;
        if (PosContext.isSuperAdmin()) {
            entities = repository.findAll();
        } else {
            Integer posId = PosContext.getPosId();
            entities = posId != null ? repository.findAllByPos_Id(posId) : List.of();
        }
        return mapper.entityListToPayload(entities, false);
    }

    @Override
    public GlobalPayload<SessionLogPayload> findByCriteria(SessionLogCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<SessionLogEntity> cq = cb.createQuery(SessionLogEntity.class);
        Root<SessionLogEntity> root = cq.from(SessionLogEntity.class);

        List<Predicate> predicates = buildPredicates(cb, root, criteria);
        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.desc(root.get("loginAt")));

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<SessionLogEntity> countRoot = countQuery.from(SessionLogEntity.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, criteria);
        countQuery.select(cb.count(countRoot));
        countQuery.where(countPredicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        List<SessionLogEntity> entities = entityManager.createQuery(cq)
                .setFirstResult(criteria.getPages() * criteria.getSize())
                .setMaxResults(criteria.getSize())
                .getResultList();

        GlobalPayload<SessionLogPayload> result = new GlobalPayload<>();
        result.setElements(mapper.entityListToPayload(entities, false));
        result.setTotalNumberOfElements(total.intValue());
        return result;
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<SessionLogEntity> root, SessionLogCriteria criteria) {
        List<Predicate> predicates = new ArrayList<>();
        if (criteria.getId() != null) predicates.add(cb.equal(root.get("id"), criteria.getId()));
        if (criteria.getUserId() != null) predicates.add(cb.equal(root.get("user").get("id"), criteria.getUserId()));
        if (criteria.getPosId() != null) {
            predicates.add(cb.equal(root.get("pos").get("id"), criteria.getPosId()));
        } else if (!PosContext.isSuperAdmin()) {
            Integer posId = PosContext.getPosId();
            if (posId != null) predicates.add(cb.equal(root.get("pos").get("id"), posId));
        }
        if (criteria.getIpAddress() != null && !criteria.getIpAddress().isEmpty()) {
            predicates.add(cb.like(root.get("ipAddress"), "%" + criteria.getIpAddress() + "%"));
        }
        return predicates;
    }
}
