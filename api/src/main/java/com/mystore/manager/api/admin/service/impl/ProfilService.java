package com.mystore.manager.api.admin.service.impl;

import com.mystore.manager.api.admin.criteria.ProfilCriteria;
import com.mystore.manager.api.admin.mapper.ProfilMapper;
import com.mystore.manager.api.admin.model.ProfilEntity;
import com.mystore.manager.api.admin.payload.ProfilPayload;
import com.mystore.manager.api.admin.repository.ProfilRepository;
import com.mystore.manager.api.admin.service.inter.IProfilService;
import com.mystore.manager.api.common.payload.GlobalPayload;
import com.mystore.manager.api.common.util.CommonUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class ProfilService implements IProfilService {

    private ProfilRepository repository;
    private ProfilMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public ProfilService(ProfilRepository repository, ProfilMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }


    @Override
    public ProfilPayload save(ProfilPayload payload) {
        return mapper.entityToPayload(repository.save(mapper.payloadToEntity(payload)));
    }

    @Override
    public boolean delete(ProfilPayload payload) {
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
    public GlobalPayload<ProfilPayload> findAllByCriteria(ProfilCriteria criteria) {
        // Admin data - no store filtering
        return CommonUtil.fetchPage(
                entityManager,
                "ProfilEntity",
                criteria,
                criteria.toMap(),
                mapper,
                null,
                false  // Don't filter by store
        );
    }



    @Override
    public ProfilPayload findById(Integer id) {
        return mapper.entityToPayload(getEntity(id));
    }

    @Override
    public ProfilEntity findByCode(String code) {
        return repository.findByCode(code);
    }

    public ProfilEntity getEntity(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public ProfilPayload update(ProfilPayload payload) {
        ProfilEntity newEntity = mapper.payloadToEntity(payload);
        ProfilEntity oldEntity = getEntity(payload.getId());
        if(oldEntity!=null){
            oldEntity.setName(Objects.nonNull(payload.getName()) ? payload.getName() : oldEntity.getName());
            oldEntity.setCode(Objects.nonNull(payload.getCode()) ? payload.getCode() : oldEntity.getCode());
            if (oldEntity.getPrivileges() != null) {
                oldEntity.getPrivileges().clear();
                if (newEntity.getPrivileges() != null) {
                    oldEntity.getPrivileges().addAll(newEntity.getPrivileges());
                }
            }
            return mapper.entityToPayload(repository.save(oldEntity));
        }
        return null;
    }

    @Override
    public List<ProfilPayload> findAll() {
        return mapper.entityListToPayload(repository.findAll(), false);
    }
}
