package com.mystore.manager.api.business.repository;

import com.mystore.manager.api.business.model.ProductCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategoryEntity, Integer> {

    ProductCategoryEntity findByCode(String code);

    // Explicit order: without it PostgreSQL returns rows in physical order, which changes
    // every time a row is updated (e.g. stock decremented by a sale) and reshuffles the POS grid.
    List<ProductCategoryEntity> findAllByPos_IdOrderByIdAsc(Integer posId);
}
