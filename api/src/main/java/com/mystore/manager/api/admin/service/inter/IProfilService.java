package com.mystore.manager.api.admin.service.inter;

import com.mystore.manager.api.admin.criteria.ProfilCriteria;
import com.mystore.manager.api.admin.model.ProfilEntity;
import com.mystore.manager.api.admin.payload.ProfilPayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

import java.util.List;

public interface IProfilService {

    ProfilPayload save(ProfilPayload payload);
    boolean delete(ProfilPayload payload);
    boolean deleteById(Integer id);
    GlobalPayload<ProfilPayload> findAllByCriteria(ProfilCriteria criteria);
    ProfilPayload findById(Integer id);
    ProfilEntity findByCode(String code);
    ProfilEntity getEntity(Integer id);
    ProfilPayload update(ProfilPayload payload);

    List<ProfilPayload> findAll();


}
