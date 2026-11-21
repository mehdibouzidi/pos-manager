package com.mystore.manager.api.business.repository;

import com.mystore.manager.api.business.model.ProductCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategoryEntity, Integer> {

    ProductCategoryEntity findByCode(String code);

    // Explicit order: without it PostgreSQL returns rows in physical order, which changes
    // every time a row is updated and reshuffles the POS grid. Ordered by code (the display order
    // set in the admin, e.g. 010, 020…), then id for categories sharing a code.
    List<ProductCategoryEntity> findAllByPos_IdOrderByCodeAscIdAsc(Integer posId);
}
