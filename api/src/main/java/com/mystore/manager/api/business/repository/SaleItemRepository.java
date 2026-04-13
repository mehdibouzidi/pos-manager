package com.mystore.manager.api.business.repository;

import com.mystore.manager.api.business.model.SaleItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItemEntity, Integer> {
}
