package com.mystore.manager.api.business.repository;

import com.mystore.manager.api.business.model.StockMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovementEntity, Integer> {
    List<StockMovementEntity> findAllByPos_Id(Integer posId);
    List<StockMovementEntity> findAllByProduct_Id(Integer productId);
}
