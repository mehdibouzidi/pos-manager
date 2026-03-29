package com.mystore.manager.api.business.repository;

import com.mystore.manager.api.business.model.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public interface ProductRepository extends JpaRepository<ProductEntity,Integer> {
    ProductEntity findByName(String name);
    ProductEntity findByCode(String code);
    List<ProductEntity> findAllByPos_Id(Integer posId);

    @Query(value = "WITH movements AS (SELECT product_fk, pos_fk, SUM(quantity) AS in_quantity, 0::numeric AS out_quantity FROM business.op_supplier_reception_note_item GROUP BY product_fk, pos_fk UNION ALL SELECT product_fk, pos_fk, 0::numeric AS in_quantity, SUM(quantity) AS out_quantity FROM business.data_product_out GROUP BY product_fk, pos_fk), movement_totals AS (SELECT product_fk, pos_fk, SUM(in_quantity) AS total_in, SUM(out_quantity) AS total_out FROM movements GROUP BY product_fk, pos_fk) SELECT product.id AS product_id, CAST(product.code AS TEXT) AS product_code, product.name AS product_name, pos.id AS pos_id, CAST(pos.code AS TEXT) AS pos_code, pos.name AS pos_name, COALESCE(movement_totals.total_in, 0) - COALESCE(movement_totals.total_out, 0) AS net_quantity, unit.code AS unit_code FROM movement_totals JOIN business.data_product AS product ON movement_totals.product_fk = product.id JOIN admin.admin_pos AS pos ON movement_totals.pos_fk = pos.id LEFT JOIN business.data_unit AS unit ON product.unit_fk = unit.id WHERE pos.id = :posId", nativeQuery = true)
    List<Object[]> findNetQuantitiesByPosId(@Param("posId") Long posId);

    @Query(value = "WITH movements AS (SELECT product_fk, pos_fk, SUM(quantity) AS in_quantity, 0::numeric AS out_quantity FROM business.op_supplier_reception_note_item GROUP BY product_fk, pos_fk UNION ALL SELECT product_fk, pos_fk, 0::numeric AS in_quantity, SUM(quantity) AS out_quantity FROM business.data_product_out GROUP BY product_fk, pos_fk), movement_totals AS (SELECT product_fk, pos_fk, SUM(in_quantity) AS total_in, SUM(out_quantity) AS total_out FROM movements GROUP BY product_fk, pos_fk) SELECT product.id AS product_id, CAST(product.code as TEXT) AS product_code, product.name AS product_name, pos.id AS pos_id, CAST(pos.code as TEXT) AS pos_code, pos.name AS pos_name, COALESCE(movement_totals.total_in, 0) - COALESCE(movement_totals.total_out, 0) AS net_quantity FROM movement_totals JOIN business.data_product AS product ON movement_totals.product_fk = product.id JOIN admin.admin_pos AS pos ON movement_totals.pos_fk = pos.id WHERE pos.id = :posId AND product.id IN :productIds", nativeQuery = true)
    List<Object[]> findNetQuantitiesByPosIdAndProductIds(@Param("posId") Integer posId, @Param("productIds") List<Integer> productIds);

    default Map<Integer, Object[]> findNetQuantitiesByPosIdAndProductIdsAsMap(Integer posId, List<Integer> productIds) {
        List<Object[]> results = findNetQuantitiesByPosIdAndProductIds(posId, productIds);
        return results.stream().collect(Collectors.toMap(row -> (Integer) row[0], row -> row));
    }

    @Query(value = "WITH movements AS (SELECT product_fk, pos_fk, SUM(quantity) AS in_quantity, 0::numeric AS out_quantity FROM business.op_supplier_reception_note_item WHERE pos_fk = :posId GROUP BY product_fk, pos_fk UNION ALL SELECT product_fk, pos_fk, 0::numeric AS in_quantity, SUM(quantity) AS out_quantity FROM business.data_product_out WHERE pos_fk = :posId GROUP BY product_fk, pos_fk), movement_totals AS (SELECT product_fk, pos_fk, SUM(in_quantity) AS total_in, SUM(out_quantity) AS total_out FROM movements GROUP BY product_fk, pos_fk) SELECT cat.name AS name, COUNT(DISTINCT p.id) AS value FROM movement_totals mt JOIN business.data_product p ON mt.product_fk = p.id JOIN business.data_sub_category sub ON p.sub_category_fk = sub.id JOIN business.data_category cat ON sub.category_fk = cat.id WHERE mt.pos_fk = :posId AND (mt.total_in - mt.total_out) > 0 GROUP BY cat.name", nativeQuery = true)
    List<Object[]> findCategoryDistributionByPosId(@Param("posId") Integer posId);

    @Query(value = "WITH movements AS (SELECT osrni.product_fk, SUM(osrni.quantity) AS in_quantity, 0::numeric AS out_quantity FROM business.op_supplier_reception_note_item osrni WHERE CASE WHEN :applyFilter = TRUE THEN osrni.product_fk IN (:productIds) ELSE TRUE END GROUP BY osrni.product_fk UNION ALL SELECT dpo.product_fk, 0::numeric AS in_quantity, SUM(dpo.quantity) AS out_quantity FROM business.data_product_out dpo WHERE CASE WHEN :applyFilter = TRUE THEN dpo.product_fk IN (:productIds) ELSE TRUE END GROUP BY dpo.product_fk) SELECT movements.product_fk, SUM(movements.in_quantity) - SUM(movements.out_quantity) AS net_quantity FROM movements GROUP BY movements.product_fk", nativeQuery = true)
    List<Object[]> findGlobalNetQuantitiesByProductIds(@Param("productIds") List<Integer> productIds, @Param("applyFilter") boolean applyFilter);

    default Map<Integer, BigDecimal> findGlobalNetQuantitiesByProductIdsAsMap(List<Integer> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyMap();
        }
        boolean applyFilter = true;
        return findGlobalNetQuantitiesByProductIds(productIds, applyFilter)
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).intValue(),
                        row -> {
                            Object quantity = row[1];
                            if (quantity instanceof BigDecimal) {
                                return (BigDecimal) quantity;
                            }
                            return quantity == null ? BigDecimal.ZERO : BigDecimal.valueOf(((Number) quantity).doubleValue());
                        }
                ));
    }
}
