package com.mystore.manager.api.admin.repository;

import com.mystore.manager.api.admin.model.PosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PosRepository extends JpaRepository<PosEntity, Integer>, JpaSpecificationExecutor<PosEntity> {
    Optional<PosEntity> findByCode(String code);
    boolean existsByCode(String code);
}
