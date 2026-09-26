package com.mystore.manager.api.business;

import com.mystore.manager.api.business.payload.*;
import com.mystore.manager.api.business.service.inter.ISaleService;
import com.mystore.manager.api.business.service.inter.ISyncBatchService;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.exception.CRUDException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Offline sync against a real PostgreSQL (Liquibase migrations applied).
 * Run explicitly: ./mvnw test -Dtest=SyncBatchIT -DargLine="-Dspring.datasource.url=... -Dspring.datasource.username=... -Dspring.datasource.password=..."
 */
@SpringBootTest
class SyncBatchIT {

    @Autowired private ISyncBatchService syncBatchService;
    @Autowired private ISaleService saleService;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private TransactionTemplate tx;

    private Integer posId;
    private Integer productId;

    @BeforeEach
    void setUp() {
        cleanUp();
        // Pool connections are not auto-commit: fixtures are committed explicitly
        tx.executeWithoutResult(s -> {
            posId = jdbc.queryForObject(
                    "INSERT INTO admin.admin_pos (code, name) VALUES (?, 'Test POS') RETURNING id", Integer.class,
                    "IT-" + UUID.randomUUID().toString().substring(0, 8));
            productId = jdbc.queryForObject(
                    "INSERT INTO business.data_product (code, name, current_stock, pos_fk) VALUES ('P1', 'Produit', 10, ?) RETURNING id",
                    Integer.class, posId);
        });
        PosContext.setPosId(posId);
    }

    @AfterEach
    void tearDown() {
        PosContext.clear();
        cleanUp();
    }

    private void cleanUp() {
        tx.executeWithoutResult(s -> {
            jdbc.update("DELETE FROM business.data_sale_item");
            jdbc.update("DELETE FROM business.data_stock_movement");
            jdbc.update("DELETE FROM business.data_sale");
            jdbc.update("DELETE FROM business.data_caisse_session");
            jdbc.update("DELETE FROM business.data_product WHERE code = 'P1'");
            jdbc.update("DELETE FROM admin.admin_pos WHERE code LIKE 'IT-%'");
        });
    }

    private CaisseSessionPayload open(String localId, Instant at) {
        CaisseSessionPayload p = new CaisseSessionPayload();
        p.setLocalId(localId);
        p.setOpeningBalance(100.0);
        p.setOpenedAt(at.toString());
        return p;
    }

    private CaisseSessionPayload close(String localId, Instant at) {
        CaisseSessionPayload p = new CaisseSessionPayload();
        p.setLocalId(localId);
        p.setClosingBalance(130.0);
        p.setClosedAt(at.toString());
        return p;
    }

    private SalePayload sale(String localId, Instant at, double qty) {
        SaleItemPayload item = new SaleItemPayload();
        item.setProductId(productId);
        item.setQuantity(qty);
        item.setUnitPrice(15.0);
        SalePayload s = new SalePayload();
        s.setLocalId(localId);
        s.setSaleDate(at.toString());
        s.setTotalAmount(999.0); // wrong on purpose: must be recomputed server-side
        s.setPaymentMethod("CASH");
        s.setItems(List.of(item));
        return s;
    }

    private double stock() {
        return jdbc.queryForObject("SELECT current_stock FROM business.data_product WHERE id = ?", Double.class, productId);
    }

    private int count(String sql) {
        return jdbc.queryForObject(sql, Integer.class);
    }

    @Test
    void replayingTheSameBatchDoesNotDuplicateAnything() {
        Instant t = Instant.now().minus(2, ChronoUnit.HOURS);
        SyncBatchRequestPayload batch = new SyncBatchRequestPayload();
        batch.setOpenSession(open("o1", t));
        batch.setSales(List.of(sale("s1", t.plusSeconds(60), 2)));
        batch.setCloseSession(close("c1", t.plusSeconds(120)));

        SyncBatchResultPayload first = syncBatchService.process(batch);
        SyncBatchResultPayload replay = syncBatchService.process(batch);

        assertNull(first.getOpenSessionError());
        assertNull(first.getCloseSessionError());
        assertTrue(first.getSalesResults().get(0).isSuccess());
        assertNull(replay.getOpenSessionError());
        assertNull(replay.getCloseSessionError());
        assertTrue(replay.getSalesResults().get(0).isSuccess());
        assertEquals(first.getSalesResults().get(0).getOrderNumber(), replay.getSalesResults().get(0).getOrderNumber());

        assertEquals(1, count("SELECT COUNT(*) FROM business.data_caisse_session"));
        assertEquals(1, count("SELECT COUNT(*) FROM business.data_sale"));
        assertEquals(8.0, stock(), 0.0001);
        assertEquals(30.0, jdbc.queryForObject("SELECT total_amount FROM business.data_sale", Double.class), 0.0001);
        // Real opening time kept, not the sync time
        // (timestamps are stored as UTC wall-clock time)
        assertEquals(t.truncatedTo(ChronoUnit.SECONDS).toString(),
                jdbc.queryForObject("SELECT to_char(opened_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') FROM business.data_caisse_session", String.class));
    }

    @Test
    void twoOfflineSessionsStaySeparate() {
        Instant t = Instant.now().minus(3, ChronoUnit.HOURS);
        SyncBatchRequestPayload b1 = new SyncBatchRequestPayload();
        b1.setOpenSession(open("o1", t));
        b1.setSales(List.of(sale("s1", t.plusSeconds(60), 1)));
        b1.setCloseSession(close("c1", t.plusSeconds(120)));
        SyncBatchRequestPayload b2 = new SyncBatchRequestPayload();
        b2.setOpenSession(open("o2", t.plusSeconds(600)));
        b2.setSales(List.of(sale("s2", t.plusSeconds(660), 1), sale("s3", t.plusSeconds(700), 1)));
        b2.setCloseSession(close("c2", t.plusSeconds(800)));

        syncBatchService.process(b1);
        syncBatchService.process(b2);

        assertEquals(2, count("SELECT COUNT(*) FROM business.data_caisse_session WHERE status = 'CLOSED'"));
        List<Integer> perSession = jdbc.queryForList(
                "SELECT total_sales_count FROM business.data_caisse_session ORDER BY opened_at", Integer.class);
        assertEquals(List.of(1, 2), perSession);
        assertEquals(List.of(1, 2, 3), jdbc.queryForList(
                "SELECT order_number FROM business.data_sale ORDER BY sale_date", Integer.class));
    }

    @Test
    void saleWithoutOpenSessionIsRejectedNotOrphaned() {
        SyncBatchRequestPayload batch = new SyncBatchRequestPayload();
        batch.setSales(List.of(sale("s1", Instant.now(), 1)));

        SyncBatchResultPayload result = syncBatchService.process(batch);

        assertFalse(result.getSalesResults().get(0).isSuccess());
        assertEquals(0, count("SELECT COUNT(*) FROM business.data_sale"));
        assertEquals(10.0, stock(), 0.0001);
    }

    @Test
    void unknownProductRejectsTheWholeSale() {
        syncBatchService.process(new SyncBatchRequestPayload() {{ setOpenSession(open("o1", Instant.now())); }});
        SalePayload bad = sale("s1", Instant.now(), 1);
        bad.getItems().get(0).setProductId(-1);

        assertThrows(CRUDException.class, () -> saleService.save(bad));
        assertEquals(0, count("SELECT COUNT(*) FROM business.data_sale"));
    }

    @Test
    void offlineOpenWhileAnotherSessionIsOpenContinuesInIt() {
        Instant t = Instant.now().minus(1, ChronoUnit.HOURS);
        SyncBatchRequestPayload online = new SyncBatchRequestPayload();
        online.setOpenSession(open("online", t));
        syncBatchService.process(online);

        SyncBatchRequestPayload offline = new SyncBatchRequestPayload();
        offline.setOpenSession(open("offline", t.plusSeconds(60)));
        offline.setSales(List.of(sale("s1", t.plusSeconds(120), 1)));
        SyncBatchResultPayload result = syncBatchService.process(offline);

        assertNull(result.getOpenSessionError());
        assertTrue(result.getSalesResults().get(0).isSuccess());
        assertEquals(1, count("SELECT COUNT(*) FROM business.data_caisse_session"));
        assertEquals(1, count("SELECT COUNT(*) FROM business.data_sale WHERE caisse_session_fk IS NOT NULL"));
    }

    @Test
    void orderNumberFollowsTheBusinessDayOfTheSale() {
        Instant yesterday = Instant.now().minus(1, ChronoUnit.DAYS);
        SyncBatchRequestPayload batch = new SyncBatchRequestPayload();
        batch.setOpenSession(open("o1", yesterday));
        batch.setSales(List.of(sale("today", Instant.now(), 1), sale("yesterday", yesterday.plusSeconds(60), 1)));

        SyncBatchResultPayload result = syncBatchService.process(batch);

        assertEquals(1, result.getSalesResults().get(0).getOrderNumber());
        assertEquals(1, result.getSalesResults().get(1).getOrderNumber());
    }
}
