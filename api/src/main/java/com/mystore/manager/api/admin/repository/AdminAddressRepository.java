package com.mystore.manager.api.admin.repository;

import com.mystore.manager.api.admin.model.AdminAddressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminAddressRepository extends JpaRepository<AdminAddressEntity, Integer> {
}
