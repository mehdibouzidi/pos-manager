package com.mystore.manager.api.business;

import com.mystore.manager.api.business.payload.SaleItemPayload;
import com.mystore.manager.api.business.payload.SalePayload;
import com.mystore.manager.api.business.payload.StockMovementPayload;
import com.mystore.manager.api.business.service.inter.ISaleService;
import com.mystore.manager.api.business.service.inter.IStockMovementService;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.exception.CRUDException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

/** Stock movements against a real PostgreSQL. Run explicitly like SyncBatchIT. */
@SpringBootTest
class StockMovementIT {

    @Autowired private IStockMovementService stockMovementService;
    @Autowired private ISaleService saleService;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private TransactionTemplate tx;

    private Integer posId;
    private Integer productId;

    @BeforeEach
    void setUp() {
        cleanUp();
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

    private StockMovementPayload movement(String type, double qty) {
        StockMovementPayload p = new StockMovementPayload();
        p.setProductId(productId);
        p.setMovementType(type);
        p.setQuantity(qty);
        return p;
    }

    private double stock() {
        return jdbc.queryForObject("SELECT current_stock FROM business.data_product WHERE id = ?", Double.class, productId);
    }

    @Test
    void editingAndDeletingAMovementKeepsStockConsistent() {
        StockMovementPayload entry = stockMovementService.save(movement("ENTRY", 5));
        assertEquals(15, stock(), 1e-9);

        StockMovementPayload edit = movement("ENTRY", 8);
        edit.setId(entry.getId());
        stockMovementService.update(edit);
        assertEquals(18, stock(), 1e-9);

        StockMovementPayload toLoss = movement("LOSS", 2);
        toLoss.setId(entry.getId());
        stockMovementService.update(toLoss);
        assertEquals(8, stock(), 1e-9);

        stockMovementService.deleteById(entry.getId());
        assertEquals(10, stock(), 1e-9);
    }

    @Test
    void invalidQuantityIsRejected() {
        assertThrows(CRUDException.class, () -> stockMovementService.save(movement("ENTRY", 0)));
        assertThrows(CRUDException.class, () -> stockMovementService.save(movement("LOSS", -3)));
        assertEquals(10, stock(), 1e-9);
    }

    @Test
    void concurrentMovementsAreNotLost() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        List<Callable<Object>> tasks = new java.util.ArrayList<>();
        for (int i = 0; i < 40; i++) {
            tasks.add(() -> {
                PosContext.setPosId(posId);
                try { return stockMovementService.save(movement("ENTRY", 1)); } finally { PosContext.clear(); }
            });
        }
        for (Future<Object> f : pool.invokeAll(tasks)) f.get();
        pool.shutdown();
        assertEquals(50, stock(), 1e-9);
    }

    @Test
    void saleMovementsCannotBeEditedOrDeleted_andOnlyCashIsAccepted() {
        tx.executeWithoutResult(s -> jdbc.update(
                "INSERT INTO business.data_caisse_session (opened_at, opening_balance, status, pos_fk) VALUES (now(), 0, 'OPEN', ?)", posId));
        SaleItemPayload item = new SaleItemPayload();
        item.setProductId(productId);
        item.setQuantity(1.0);
        item.setUnitPrice(10.0);
        SalePayload sale = new SalePayload();
        sale.setItems(List.of(item));

        sale.setPaymentMethod("CARD");
        assertThrows(CRUDException.class, () -> saleService.save(sale));

        sale.setPaymentMethod(null);
        saleService.save(sale);
        assertEquals(9, stock(), 1e-9);
        assertEquals("CASH", jdbc.queryForObject("SELECT payment_method FROM business.data_sale", String.class));

        Integer saleMovementId = jdbc.queryForObject(
                "SELECT id FROM business.data_stock_movement WHERE movement_type = 'SALE'", Integer.class);
        assertThrows(CRUDException.class, () -> stockMovementService.deleteById(saleMovementId));
        assertEquals(9, stock(), 1e-9);
    }
}
