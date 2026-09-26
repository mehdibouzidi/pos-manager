package com.mystore.manager.api.admin.repository;

import com.mystore.manager.api.admin.model.PosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PosRepository extends JpaRepository<PosEntity, Integer>, JpaSpecificationExecutor<PosEntity> {
    Optional<PosEntity> findByCode(String code);
    boolean existsByCode(String code);

    /** Row lock on the POS: serialises order-number allocation and session open/close per terminal. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PosEntity p WHERE p.id = :id")
    Optional<PosEntity> lockById(@Param("id") Integer id);
}
