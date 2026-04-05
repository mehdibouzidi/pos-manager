package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.business.payload.DashboardPayload;
import com.mystore.manager.api.business.service.inter.IDashboardService;
import com.mystore.manager.api.common.context.PosContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService implements IDashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public DashboardPayload getStats(String period) {
        Integer posId = PosContext.isSuperAdmin() ? null : PosContext.getPosId();

        DashboardPayload payload = new DashboardPayload();
        buildKpis(payload, posId);
        buildProductStats(payload, posId);
        buildSalesHistory(payload, posId, period);
        return payload;
    }

    @SuppressWarnings("unchecked")
    private void buildKpis(DashboardPayload payload, Integer posId) {
        String posClause = posId != null ? "AND sm.pos_fk = :posId" : "";

        // Sales KPIs
        String salesSql =
                "SELECT COUNT(sm.id), COALESCE(SUM(sm.quantity), 0), COALESCE(SUM(sm.quantity * p.retail_price), 0) " +
                "FROM business.data_stock_movement sm " +
                "JOIN business.data_product p ON sm.product_fk = p.id " +
                "WHERE sm.movement_type = 'SALE' " + posClause;

        Query salesQuery = entityManager.createNativeQuery(salesSql);
        if (posId != null) salesQuery.setParameter("posId", posId);
        Object[] salesResult = (Object[]) salesQuery.getSingleResult();
        payload.setTotalSalesCount(toLong(salesResult[0]));
        payload.setTotalSalesQuantity(toDouble(salesResult[1]));
        payload.setTotalSalesRevenue(toBigDecimal(salesResult[2]));

        // Entry value
        String entrySql =
                "SELECT COALESCE(SUM(sm.quantity * p.retail_price), 0) " +
                "FROM business.data_stock_movement sm " +
                "JOIN business.data_product p ON sm.product_fk = p.id " +
                "WHERE sm.movement_type = 'ENTRY' " + posClause;

        Query entryQuery = entityManager.createNativeQuery(entrySql);
        if (posId != null) entryQuery.setParameter("posId", posId);
        payload.setTotalEntryValue(toBigDecimal(entryQuery.getSingleResult()));

        // Loss value
        String lossSql =
                "SELECT COALESCE(SUM(sm.quantity * p.retail_price), 0) " +
                "FROM business.data_stock_movement sm " +
                "JOIN business.data_product p ON sm.product_fk = p.id " +
                "WHERE sm.movement_type = 'LOSS' " + posClause;

        Query lossQuery = entityManager.createNativeQuery(lossSql);
        if (posId != null) lossQuery.setParameter("posId", posId);
        payload.setTotalLossValue(toBigDecimal(lossQuery.getSingleResult()));

        BigDecimal revenue = payload.getTotalSalesRevenue() != null ? payload.getTotalSalesRevenue() : BigDecimal.ZERO;
        BigDecimal entryVal = payload.getTotalEntryValue() != null ? payload.getTotalEntryValue() : BigDecimal.ZERO;
        BigDecimal lossVal = payload.getTotalLossValue() != null ? payload.getTotalLossValue() : BigDecimal.ZERO;
        payload.setNetBenefit(revenue.subtract(entryVal).subtract(lossVal));
    }

    @SuppressWarnings("unchecked")
    private void buildProductStats(DashboardPayload payload, Integer posId) {
        String posClause = posId != null ? "AND sm.pos_fk = :posId " : "";

        String sql =
                "SELECT p.id, p.code, p.name, p.retail_price, " +
                "  COUNT(CASE WHEN sm.movement_type = 'SALE' THEN 1 END) AS sales_count, " +
                "  COALESCE(SUM(CASE WHEN sm.movement_type = 'SALE' THEN sm.quantity ELSE 0 END), 0) AS sales_qty, " +
                "  COALESCE(SUM(CASE WHEN sm.movement_type = 'SALE' THEN sm.quantity * p.retail_price ELSE 0 END), 0) AS sales_revenue, " +
                "  COALESCE(SUM(CASE WHEN sm.movement_type = 'ENTRY' THEN sm.quantity ELSE 0 END), 0) AS entry_qty, " +
                "  COALESCE(SUM(CASE WHEN sm.movement_type = 'ENTRY' THEN sm.quantity * p.retail_price ELSE 0 END), 0) AS entry_value " +
                "FROM business.data_stock_movement sm " +
                "JOIN business.data_product p ON sm.product_fk = p.id " +
                "WHERE sm.movement_type IN ('SALE', 'ENTRY') " + posClause +
                "GROUP BY p.id, p.code, p.name, p.retail_price " +
                "HAVING COUNT(CASE WHEN sm.movement_type = 'SALE' THEN 1 END) > 0 " +
                "ORDER BY sales_revenue DESC NULLS LAST";

        Query query = entityManager.createNativeQuery(sql);
        if (posId != null) query.setParameter("posId", posId);

        List<Object[]> results = query.getResultList();
        List<DashboardPayload.ProductSalesStats> productStats = new ArrayList<>();

        for (Object[] row : results) {
            DashboardPayload.ProductSalesStats stats = new DashboardPayload.ProductSalesStats();
            stats.setProductId(toInteger(row[0]));
            stats.setProductCode(row[1] != null ? row[1].toString() : null);
            stats.setProductName(row[2] != null ? row[2].toString() : null);
            stats.setRetailPrice(toBigDecimal(row[3]));
            stats.setSalesCount(toLong(row[4]));
            stats.setSalesQuantity(toDouble(row[5]));
            stats.setSalesRevenue(toBigDecimal(row[6]));
            stats.setEntryQuantity(toDouble(row[7]));
            BigDecimal entryValue = toBigDecimal(row[8]);
            stats.setEntryValue(entryValue);
            BigDecimal salesRevenue = toBigDecimal(row[6]);
            stats.setMargin(salesRevenue.subtract(entryValue));
            // avg cost price = entryValue / entryQty (if entries exist)
            double entryQty = toDouble(row[7]);
            if (entryQty > 0) {
                stats.setAvgCostPrice(entryValue.divide(BigDecimal.valueOf(entryQty), 2, java.math.RoundingMode.HALF_UP));
            } else {
                stats.setAvgCostPrice(BigDecimal.ZERO);
            }
            productStats.add(stats);
        }

        payload.setProductStats(productStats);
    }

    @SuppressWarnings("unchecked")
    private void buildSalesHistory(DashboardPayload payload, Integer posId, String period) {
        String datePart;
        Instant startDate;

        if ("YEAR".equalsIgnoreCase(period)) {
            datePart = "YYYY-MM";
            startDate = Instant.now().minus(365, ChronoUnit.DAYS);
        } else if ("WEEK".equalsIgnoreCase(period)) {
            datePart = "YYYY-MM-DD";
            startDate = Instant.now().minus(7, ChronoUnit.DAYS);
        } else {
            // Default: MONTH — last 30 days grouped by day
            datePart = "YYYY-MM-DD";
            startDate = Instant.now().minus(30, ChronoUnit.DAYS);
        }

        String posClause = posId != null ? "AND sm.pos_fk = :posId " : "";

        String sql =
                "SELECT period, COUNT(id), COALESCE(SUM(revenue), 0) " +
                "FROM ( " +
                "  SELECT to_char(sm.movement_date AT TIME ZONE 'UTC', :datePart) AS period, " +
                "         sm.id AS id, " +
                "         sm.quantity * p.retail_price AS revenue " +
                "  FROM business.data_stock_movement sm " +
                "  JOIN business.data_product p ON sm.product_fk = p.id " +
                "  WHERE sm.movement_type = 'SALE' AND sm.movement_date >= :startDate " + posClause +
                ") sub " +
                "GROUP BY period " +
                "ORDER BY period ASC";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("datePart", datePart);
        query.setParameter("startDate", startDate);
        if (posId != null) query.setParameter("posId", posId);

        List<Object[]> results = query.getResultList();
        List<DashboardPayload.SalesHistoryPoint> history = new ArrayList<>();

        for (Object[] row : results) {
            DashboardPayload.SalesHistoryPoint point = new DashboardPayload.SalesHistoryPoint();
            point.setPeriod(row[0] != null ? row[0].toString() : null);
            point.setSalesCount(toLong(row[1]));
            point.setSalesRevenue(toBigDecimal(row[2]));
            history.add(point);
        }

        payload.setSalesHistory(history);
    }

    private Long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Long l) return l;
        if (value instanceof Number n) return n.longValue();
        return Long.parseLong(value.toString());
    }

    private Double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Double d) return d;
        if (value instanceof Number n) return n.doubleValue();
        return Double.parseDouble(value.toString());
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return new BigDecimal(n.toString());
        return new BigDecimal(value.toString());
    }

    private Integer toInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer i) return i;
        if (value instanceof Number n) return n.intValue();
        return Integer.parseInt(value.toString());
    }
}
