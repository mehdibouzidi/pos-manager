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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.mystore.manager.api.business.common.util.BusinessConstants.BUSINESS_ZONE;

@Service
public class DashboardService implements IDashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    /** Movement time in the business zone (the column holds UTC timestamps without zone). */
    private static final String LOCAL_DATE_SQL = "((sm.movement_date AT TIME ZONE 'UTC') AT TIME ZONE '" + BUSINESS_ZONE.getId() + "')";
    private static final String HOUR = "HOUR", DAY = "DAY", MONTH = "MONTH";
    /** Up to this many days a custom range is charted day by day, beyond it month by month. */
    private static final int MAX_DAILY_DAYS = 92;

    /**
     * Range of the dashboard, in local business days (both inclusive; null = unbounded),
     * and the bucket of its sales history.
     */
    record Range(LocalDate from, LocalDate to, String granularity) {
        Instant start() { return from != null ? from.atStartOfDay(BUSINESS_ZONE).toInstant() : null; }
        Instant end() { return to != null ? to.plusDays(1).atStartOfDay(BUSINESS_ZONE).toInstant() : null; }
    }

    @Override
    public DashboardPayload getStats(String period, String fromDate, String toDate) {
        Integer posId = PosContext.isSuperAdmin() ? null : PosContext.getPosId();
        Range range = resolveRange(period, fromDate, toDate);

        DashboardPayload payload = new DashboardPayload();
        payload.setFromDate(range.from() != null ? range.from().toString() : null);
        payload.setToDate(range.to() != null ? range.to().toString() : null);
        payload.setGranularity(range.granularity());
        buildKpis(payload, posId, range);
        buildProductStats(payload, posId, range);
        buildSalesHistory(payload, posId, range);
        return payload;
    }

    /**
     * DAY = today (by hour), WEEK = last 7 days, MONTH = last 30 days (by day), YEAR = last 12 months,
     * ALL = since the beginning (by month), CUSTOM = fromDate..toDate (yyyy-MM-dd, inclusive).
     */
    static Range resolveRange(String period, String fromDate, String toDate) {
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        String p = period == null ? "MONTH" : period.trim().toUpperCase();
        switch (p) {
            case "DAY":
                return new Range(today, today, HOUR);
            case "WEEK":
                return new Range(today.minusDays(6), today, DAY);
            case "YEAR":
                return new Range(today.minusMonths(11).withDayOfMonth(1), today, MONTH);
            case "ALL":
                return new Range(null, null, MONTH);
            case "CUSTOM": {
                LocalDate from = parseDate(fromDate);
                LocalDate to = parseDate(toDate);
                if (from == null && to == null) {
                    return new Range(today, today, HOUR);
                }
                if (from == null) from = to;
                if (to == null) to = from;
                if (from.isAfter(to)) {
                    LocalDate tmp = from;
                    from = to;
                    to = tmp;
                }
                long days = ChronoUnit.DAYS.between(from, to) + 1;
                return new Range(from, to, days == 1 ? HOUR : days <= MAX_DAILY_DAYS ? DAY : MONTH);
            }
            default:
                return new Range(today.minusDays(29), today, DAY);
        }
    }

    private static LocalDate parseDate(String value) {
        try {
            return value == null || value.isBlank() ? null : LocalDate.parse(value.trim());
        } catch (Exception e) {
            return null;
        }
    }

    /** "AND sm.movement_date >= :start AND sm.movement_date < :end" for the bounds that are set. */
    private static String rangeClause(Range range) {
        return (range.start() != null ? "AND sm.movement_date >= :start " : "")
                + (range.end() != null ? "AND sm.movement_date < :end " : "");
    }

    private static void bind(Query query, Integer posId, Range range) {
        if (posId != null) query.setParameter("posId", posId);
        if (range.start() != null) query.setParameter("start", range.start());
        if (range.end() != null) query.setParameter("end", range.end());
    }

    @SuppressWarnings("unchecked")
    private void buildKpis(DashboardPayload payload, Integer posId, Range range) {
        String posClause = (posId != null ? "AND sm.pos_fk = :posId " : "") + rangeClause(range);

        // Sales KPIs
        String salesSql =
                "SELECT COUNT(sm.id), COALESCE(SUM(sm.quantity), 0), COALESCE(SUM(sm.quantity * p.retail_price), 0) " +
                "FROM business.data_stock_movement sm " +
                "JOIN business.data_product p ON sm.product_fk = p.id " +
                "WHERE sm.movement_type = 'SALE' " + posClause;

        Query salesQuery = entityManager.createNativeQuery(salesSql);
        bind(salesQuery, posId, range);
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
        bind(entryQuery, posId, range);
        payload.setTotalEntryValue(toBigDecimal(entryQuery.getSingleResult()));

        // Loss value
        String lossSql =
                "SELECT COALESCE(SUM(sm.quantity * p.retail_price), 0) " +
                "FROM business.data_stock_movement sm " +
                "JOIN business.data_product p ON sm.product_fk = p.id " +
                "WHERE sm.movement_type = 'LOSS' " + posClause;

        Query lossQuery = entityManager.createNativeQuery(lossSql);
        bind(lossQuery, posId, range);
        payload.setTotalLossValue(toBigDecimal(lossQuery.getSingleResult()));

        BigDecimal revenue = payload.getTotalSalesRevenue() != null ? payload.getTotalSalesRevenue() : BigDecimal.ZERO;
        BigDecimal entryVal = payload.getTotalEntryValue() != null ? payload.getTotalEntryValue() : BigDecimal.ZERO;
        BigDecimal lossVal = payload.getTotalLossValue() != null ? payload.getTotalLossValue() : BigDecimal.ZERO;
        payload.setNetBenefit(revenue.subtract(entryVal).subtract(lossVal));
    }

    @SuppressWarnings("unchecked")
    private void buildProductStats(DashboardPayload payload, Integer posId, Range range) {
        String posClause = (posId != null ? "AND sm.pos_fk = :posId " : "") + rangeClause(range);

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
        bind(query, posId, range);

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
    private void buildSalesHistory(DashboardPayload payload, Integer posId, Range range) {
        String bucketFormat = switch (range.granularity()) {
            case HOUR -> "YYYY-MM-DD HH24";
            case MONTH -> "YYYY-MM";
            default -> "YYYY-MM-DD";
        };
        String posClause = (posId != null ? "AND sm.pos_fk = :posId " : "") + rangeClause(range);

        String sql =
                "SELECT bucket, COUNT(id), COALESCE(SUM(revenue), 0) " +
                "FROM ( " +
                "  SELECT to_char(" + LOCAL_DATE_SQL + ", '" + bucketFormat + "') AS bucket, " +
                "         sm.id AS id, " +
                "         sm.quantity * p.retail_price AS revenue " +
                "  FROM business.data_stock_movement sm " +
                "  JOIN business.data_product p ON sm.product_fk = p.id " +
                "  WHERE sm.movement_type = 'SALE' " + posClause +
                ") sub " +
                "GROUP BY bucket " +
                "ORDER BY bucket ASC";

        Query query = entityManager.createNativeQuery(sql);
        bind(query, posId, range);

        Map<String, Object[]> byBucket = new LinkedHashMap<>();
        for (Object[] row : (List<Object[]>) query.getResultList()) {
            if (row[0] != null) byBucket.put(row[0].toString(), row);
        }

        // Every bucket of the range, empty ones at 0, so the chart keeps a regular time axis
        List<DashboardPayload.SalesHistoryPoint> history = new ArrayList<>();
        for (String bucket : buckets(range, byBucket.keySet())) {
            Object[] row = byBucket.get(bucket);
            DashboardPayload.SalesHistoryPoint point = new DashboardPayload.SalesHistoryPoint();
            point.setPeriod(label(bucket, range.granularity()));
            point.setSalesCount(row != null ? toLong(row[1]) : 0L);
            point.setSalesRevenue(row != null ? toBigDecimal(row[2]) : BigDecimal.ZERO);
            history.add(point);
        }
        payload.setSalesHistory(history);
    }

    private static final DateTimeFormatter HOUR_KEY = DateTimeFormatter.ofPattern("yyyy-MM-dd HH");
    private static final DateTimeFormatter DAY_KEY = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter MONTH_KEY = DateTimeFormatter.ofPattern("yyyy-MM");

    /** Bucket keys covering the range (same format as the SQL to_char); unbounded start = first sale. */
    private static List<String> buckets(Range range, java.util.Set<String> found) {
        List<String> keys = new ArrayList<>();
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        switch (range.granularity()) {
            case HOUR -> {
                LocalDateTime t = range.from().atStartOfDay();
                LocalDateTime end = range.to().plusDays(1).atStartOfDay();
                for (; t.isBefore(end); t = t.plusHours(1)) keys.add(t.format(HOUR_KEY));
            }
            case DAY -> {
                for (LocalDate d = range.from(); !d.isAfter(range.to()); d = d.plusDays(1)) keys.add(d.format(DAY_KEY));
            }
            default -> {
                YearMonth first = range.from() != null ? YearMonth.from(range.from())
                        : found.stream().findFirst().map(YearMonth::parse).orElse(YearMonth.from(today));
                YearMonth last = range.to() != null ? YearMonth.from(range.to()) : YearMonth.from(today);
                for (YearMonth m = first; !m.isAfter(last); m = m.plusMonths(1)) keys.add(m.format(MONTH_KEY));
            }
        }
        return keys;
    }

    /** Axis label: "14h", "22/11", "11/2026". */
    private static String label(String bucket, String granularity) {
        return switch (granularity) {
            case HOUR -> Integer.parseInt(bucket.substring(11, 13)) + "h";
            case MONTH -> bucket.substring(5, 7) + "/" + bucket.substring(0, 4);
            default -> bucket.substring(8, 10) + "/" + bucket.substring(5, 7);
        };
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
