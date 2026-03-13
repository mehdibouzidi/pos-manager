package com.mystore.manager.api.admin.service.impl;

import com.mystore.manager.api.admin.criteria.PrivilegeCriteria;
import com.mystore.manager.api.admin.mapper.PrivilegeMapper;
import com.mystore.manager.api.admin.model.PrivilegeEntity;
import com.mystore.manager.api.admin.payload.PrivilegePayload;
import com.mystore.manager.api.admin.repository.PrivilegeRepository;
import com.mystore.manager.api.admin.service.inter.IPrivilegeService;
import com.mystore.manager.api.common.payload.GlobalPayload;
import com.mystore.manager.api.common.util.CommonUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class PrivilegeService implements IPrivilegeService {

    private PrivilegeRepository repository;
    private PrivilegeMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public PrivilegeService(PrivilegeRepository repository, PrivilegeMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }


    @Override
    public PrivilegePayload save(PrivilegePayload payload) {
        return mapper.entityToPayload(repository.save(mapper.payloadToEntity(payload)));
    }

    @Override
    public boolean delete(PrivilegePayload payload) {
        try {
            repository.delete(mapper.payloadToEntity(payload));
            return true;
        }catch (Exception e){
            return false;
        }
    }

    @Override
    public boolean deleteById(Integer id) {
        repository.deleteById(id);
        return true;
    }

    @Override
    public GlobalPayload<PrivilegePayload> findAllByCriteria(PrivilegeCriteria criteria) {
        // Admin data - no store filtering
        return CommonUtil.fetchPage(
                entityManager,
                "PrivilegeEntity",
                criteria,
                criteria.toMap(),
                mapper,
                null,
                false  // Don't filter by store
        );
    }



    @Override
    public PrivilegePayload findById(Integer id) {
        return mapper.entityToPayload(getEntity(id));
    }

    @Override
    public PrivilegeEntity findByCode(String code) {
        return repository.findByCode(code);
    }

    public PrivilegeEntity getEntity(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    @Override
    public PrivilegePayload update(PrivilegePayload payload) {
        PrivilegeEntity entity = getEntity(payload.getId());
        if(entity!=null){
            entity.setName(Objects.nonNull(payload.getName()) ? payload.getName() : entity.getName());
            entity.setCode(Objects.nonNull(payload.getCode()) ? payload.getCode() : entity.getCode());
            PrivilegeEntity savedEntity = repository.save(entity);
            return mapper.entityToPayload(savedEntity);
        }
        return null;
    }

    @Override
    public List<PrivilegePayload> findAll() {
        return mapper.entityListToPayload(repository.findAll(), false);
    }
}
