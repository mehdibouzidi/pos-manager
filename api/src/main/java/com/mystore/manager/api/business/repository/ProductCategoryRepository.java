package com.mystore.manager.api.business.repository;

import com.mystore.manager.api.business.model.ProductCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategoryEntity, Integer> {

    ProductCategoryEntity findByCode(String code);

    List<ProductCategoryEntity> findAllByPos_Id(Integer posId);
}
