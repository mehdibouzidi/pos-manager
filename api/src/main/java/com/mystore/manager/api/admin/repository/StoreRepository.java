package com.mystore.manager.api.admin.repository;

import com.mystore.manager.api.admin.model.StoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<StoreEntity, Integer>, JpaSpecificationExecutor<StoreEntity> {
    Optional<StoreEntity> findByCode(String code);
    boolean existsByCode(String code);
}
