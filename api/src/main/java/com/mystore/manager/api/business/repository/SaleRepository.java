package com.mystore.manager.api.business.repository;

import com.mystore.manager.api.business.model.SaleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<SaleEntity, Integer> {

    List<SaleEntity> findAllByPos_Id(Integer posId);

    @Query("SELECT COALESCE(MAX(s.orderNumber), 0) FROM SaleEntity s WHERE s.pos.id = :posId AND s.saleDate >= :from AND s.saleDate < :to")
    int findMaxOrderNumberByPosAndDate(
            @Param("posId") Integer posId,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    @Query("SELECT COALESCE(MAX(s.orderNumber), 0) FROM SaleEntity s WHERE s.pos IS NULL AND s.saleDate >= :from AND s.saleDate < :to")
    int findMaxOrderNumberByNoPosAndDate(
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0.0), COUNT(s.id) FROM SaleEntity s WHERE s.pos.id = :posId AND s.saleDate >= :from AND s.saleDate < :to")
    Object[] findSalesTotalsByPosAndDateBetween(
            @Param("posId") Integer posId,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0.0), COUNT(s.id) FROM SaleEntity s WHERE s.caisseSession.id = :sessionId")
    List<Object[]> findSalesTotalsBySession(@Param("sessionId") Integer sessionId);
}
