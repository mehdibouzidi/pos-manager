package com.mystore.manager.api.admin.repository;

import com.mystore.manager.api.admin.model.SessionLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionLogRepository extends JpaRepository<SessionLogEntity, Integer> {
    List<SessionLogEntity> findAllByUser_Id(Integer userId);
    List<SessionLogEntity> findAllByPos_Id(Integer posId);
}
