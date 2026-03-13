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
    List<ProductEntity> findAllByStore_Id(Integer storeId);

    @Query(value = "WITH movements AS (SELECT product_fk, store_fk, SUM(quantity) AS in_quantity, 0::numeric AS out_quantity FROM business.op_supplier_reception_note_item GROUP BY product_fk, store_fk UNION ALL SELECT product_fk, store_fk, 0::numeric AS in_quantity, SUM(quantity) AS out_quantity FROM business.data_product_out GROUP BY product_fk, store_fk), movement_totals AS (SELECT product_fk, store_fk, SUM(in_quantity) AS total_in, SUM(out_quantity) AS total_out FROM movements GROUP BY product_fk, store_fk) SELECT product.id AS product_id, CAST(product.code AS TEXT) AS product_code, product.name AS product_name, store.id AS store_id, CAST(store.code AS TEXT) AS store_code, store.name AS store_name, COALESCE(movement_totals.total_in, 0) - COALESCE(movement_totals.total_out, 0) AS net_quantity, unit.code AS unit_code FROM movement_totals JOIN business.data_product AS product ON movement_totals.product_fk = product.id JOIN business.data_store AS store ON movement_totals.store_fk = store.id LEFT JOIN business.data_unit AS unit ON product.unit_fk = unit.id WHERE store.id = :storeId", nativeQuery = true)
    List<Object[]> findNetQuantitiesByStoreId(@Param("storeId") Long storeId);

    @Query(value = "WITH movements AS (SELECT product_fk, store_fk, SUM(quantity) AS in_quantity, 0::numeric AS out_quantity FROM business.op_supplier_reception_note_item GROUP BY product_fk, store_fk UNION ALL SELECT product_fk, store_fk, 0::numeric AS in_quantity, SUM(quantity) AS out_quantity FROM business.data_product_out GROUP BY product_fk, store_fk), movement_totals AS (SELECT product_fk, store_fk, SUM(in_quantity) AS total_in, SUM(out_quantity) AS total_out FROM movements GROUP BY product_fk, store_fk) SELECT product.id AS product_id, CAST(product.code as TEXT) AS product_code, product.name AS product_name, store.id AS store_id, CAST(store.code as TEXT) AS store_code, store.name AS store_name, COALESCE(movement_totals.total_in, 0) - COALESCE(movement_totals.total_out, 0) AS net_quantity FROM movement_totals JOIN business.data_product AS product ON movement_totals.product_fk = product.id JOIN business.data_store AS store ON movement_totals.store_fk = store.id WHERE store.id = :storeId AND product.id IN :productIds", nativeQuery = true)
    List<Object[]> findNetQuantitiesByStoreIdAndProductIds(@Param("storeId") Integer storeId, @Param("productIds") List<Integer> productIds);

    default Map<Integer, Object[]> findNetQuantitiesByStoreIdAndProductIdsAsMap(Integer storeId, List<Integer> productIds) {
        List<Object[]> results = findNetQuantitiesByStoreIdAndProductIds(storeId, productIds);
        return results.stream().collect(Collectors.toMap(row -> (Integer) row[0], row -> row));
    }

    @Query(value = "WITH movements AS (SELECT product_fk, store_fk, SUM(quantity) AS in_quantity, 0::numeric AS out_quantity FROM business.op_supplier_reception_note_item WHERE store_fk = :storeId GROUP BY product_fk, store_fk UNION ALL SELECT product_fk, store_fk, 0::numeric AS in_quantity, SUM(quantity) AS out_quantity FROM business.data_product_out WHERE store_fk = :storeId GROUP BY product_fk, store_fk), movement_totals AS (SELECT product_fk, store_fk, SUM(in_quantity) AS total_in, SUM(out_quantity) AS total_out FROM movements GROUP BY product_fk, store_fk) SELECT cat.name AS name, COUNT(DISTINCT p.id) AS value FROM movement_totals mt JOIN business.data_product p ON mt.product_fk = p.id JOIN business.data_sub_category sub ON p.sub_category_fk = sub.id JOIN business.data_category cat ON sub.category_fk = cat.id WHERE mt.store_fk = :storeId AND (mt.total_in - mt.total_out) > 0 GROUP BY cat.name", nativeQuery = true)
    List<Object[]> findCategoryDistributionByStoreId(@Param("storeId") Integer storeId);

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
