package com.mystore.manager.api.business.repository;

import com.mystore.manager.api.business.model.StockMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovementEntity, Integer> {
    List<StockMovementEntity> findAllByPos_Id(Integer posId);
    List<StockMovementEntity> findAllByProduct_Id(Integer productId);

    String SIGNED_QUANTITY = "SUM(CASE WHEN UPPER(m.movementType) = 'ENTRY' THEN m.quantity "
            + "WHEN UPPER(m.movementType) IN ('LOSS', 'SALE') THEN -m.quantity ELSE 0.0 END)";

    /** [productId, net stock] made by the movements of one POS. */
    @Query("SELECT m.product.id, " + SIGNED_QUANTITY + " FROM StockMovementEntity m "
            + "WHERE m.pos.id = :posId GROUP BY m.product.id")
    List<Object[]> sumByProductForPos(@Param("posId") Integer posId);

    /** [productId, net stock] made by the other POS on the products created by this POS. */
    @Query("SELECT m.product.id, " + SIGNED_QUANTITY + " FROM StockMovementEntity m "
            + "WHERE m.product.pos.id = :posId AND m.pos.id <> :posId GROUP BY m.product.id")
    List<Object[]> sumByProductForOtherPos(@Param("posId") Integer posId);
}
