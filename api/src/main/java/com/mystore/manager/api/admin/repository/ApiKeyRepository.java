package com.mystore.manager.api.admin.repository;

import com.mystore.manager.api.admin.model.ApiKeyEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKeyEntity, Integer> {
    List<ApiKeyEntity> findAllByPos_Id(Integer posId);
    // Called from ApiKeyAuthFilter, outside any Hibernate session: the POS must be loaded eagerly
    // or reading its code throws LazyInitializationException (every API-key request then fails with 403).
    @EntityGraph(attributePaths = "pos")
    Optional<ApiKeyEntity> findByKeyValue(String keyValue);
    boolean existsByKeyValue(String keyValue);
}
