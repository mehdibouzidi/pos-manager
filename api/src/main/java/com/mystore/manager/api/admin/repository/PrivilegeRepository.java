package com.mystore.manager.api.admin.repository;

import com.mystore.manager.api.admin.model.PrivilegeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrivilegeRepository extends JpaRepository<PrivilegeEntity, Integer> {
    PrivilegeEntity findByCode(String code);
}
