package com.mystore.manager.api.business.repository;

import com.mystore.manager.api.business.model.CaisseSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CaisseSessionRepository extends JpaRepository<CaisseSessionEntity, Integer> {

    Optional<CaisseSessionEntity> findByPos_IdAndStatus(Integer posId, String status);
}
