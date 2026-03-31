package com.mystore.manager.api.admin.repository;

import com.mystore.manager.api.admin.model.ApiKeyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKeyEntity, Integer> {
    List<ApiKeyEntity> findAllByPos_Id(Integer posId);
    Optional<ApiKeyEntity> findByKeyValue(String keyValue);
    boolean existsByKeyValue(String keyValue);
}
