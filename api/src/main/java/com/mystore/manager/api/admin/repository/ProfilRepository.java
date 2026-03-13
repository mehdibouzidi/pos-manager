package com.mystore.manager.api.admin.repository;

import com.mystore.manager.api.admin.model.ProfilEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfilRepository extends JpaRepository<ProfilEntity, Integer> {
    ProfilEntity findByCode(String code);
}
