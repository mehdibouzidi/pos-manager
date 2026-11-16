package com.mystore.manager.api.business;

import com.mystore.manager.api.business.payload.ProductCategoryPayload;
import com.mystore.manager.api.business.payload.ProductPayload;
import com.mystore.manager.api.business.payload.StockMovementPayload;
import com.mystore.manager.api.business.service.inter.IProductCategoryService;
import com.mystore.manager.api.business.service.inter.IProductService;
import com.mystore.manager.api.business.service.inter.IStockMovementService;
import com.mystore.manager.api.common.context.PosContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Till catalogue shared by every POS, stock per POS. Against a real PostgreSQL, run explicitly like SyncBatchIT. */
@SpringBootTest
class SharedCatalogueIT {

    @Autowired private IProductService productService;
    @Autowired private IProductCategoryService categoryService;
    @Autowired private IStockMovementService stockMovementService;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private TransactionTemplate tx;

    private Integer posA;
    private Integer posB;
    private Integer productId;

    @BeforeEach
    void setUp() {
        cleanUp();
        tx.executeWithoutResult(s -> {
            posA = newPos();
            posB = newPos();
            Integer shown = jdbc.queryForObject(
                    "INSERT INTO business.data_product_category (code, name, displayed_in_pos, pos_fk) VALUES ('ITC1', 'Visible', true, ?) RETURNING id",
                    Integer.class, posA);
            Integer hidden = jdbc.queryForObject(
                    "INSERT INTO business.data_product_category (code, name, displayed_in_pos, pos_fk) VALUES ('ITC2', 'Masquée', false, ?) RETURNING id",
                    Integer.class, posA);
            // Created by POS A with 10 units that no movement explains (stock predating the movements)
            productId = jdbc.queryForObject(
                    "INSERT INTO business.data_product (code, name, current_stock, displayed_in_pos, category_fk, pos_fk) VALUES ('ITP1', 'Produit', 10, true, ?, ?) RETURNING id",
                    Integer.class, shown, posA);
            jdbc.update("INSERT INTO business.data_product (code, name, displayed_in_pos, category_fk, pos_fk) VALUES ('ITP2', 'Non affiché', false, ?, ?)", shown, posA);
            jdbc.update("INSERT INTO business.data_product (code, name, displayed_in_pos, category_fk, pos_fk) VALUES ('ITP3', 'Catégorie masquée', true, ?, ?)", hidden, posA);
        });
    }

    @AfterEach
    void tearDown() {
        PosContext.clear();
        cleanUp();
    }

    private Integer newPos() {
        return jdbc.queryForObject("INSERT INTO admin.admin_pos (code, name) VALUES (?, 'Test POS') RETURNING id", Integer.class,
                "IT-" + UUID.randomUUID().toString().substring(0, 8));
    }

    private void cleanUp() {
        tx.executeWithoutResult(s -> {
            jdbc.update("DELETE FROM business.data_stock_movement WHERE product_fk IN (SELECT id FROM business.data_product WHERE code LIKE 'ITP%')");
            jdbc.update("DELETE FROM business.data_product WHERE code LIKE 'ITP%'");
            jdbc.update("DELETE FROM business.data_product_category WHERE code LIKE 'ITC%'");
            jdbc.update("DELETE FROM admin.admin_pos WHERE code LIKE 'IT-%'");
        });
    }

    private void move(Integer posId, String type, double qty) {
        PosContext.setPosId(posId);
        StockMovementPayload p = new StockMovementPayload();
        p.setProductId(productId);
        p.setMovementType(type);
        p.setQuantity(qty);
        stockMovementService.save(p);
    }

    // Listings run in a transaction, as they do behind the web layer (open session in view)
    private List<ProductPayload> products(Integer posId, boolean displayedOnly) {
        PosContext.setPosId(posId);
        return tx.execute(s -> productService.findAll(displayedOnly));
    }

    private List<ProductCategoryPayload> categories(Integer posId, boolean displayedOnly) {
        PosContext.setPosId(posId);
        return tx.execute(s -> categoryService.findAll(displayedOnly));
    }

    private List<String> tillProductCodes(Integer posId) {
        return products(posId, true).stream().map(ProductPayload::getCode).filter(c -> c.startsWith("ITP")).toList();
    }

    private double tillStock(Integer posId) {
        return products(posId, true).stream().filter(p -> productId.equals(p.getId()))
                .findFirst().orElseThrow().getCurrentStock().doubleValue();
    }

    @Test
    void tillCatalogueIsTheSameForEveryPos_andOnlyFollowsTheDisplayFlags() {
        assertEquals(List.of("ITP1"), tillProductCodes(posA));
        assertEquals(List.of("ITP1"), tillProductCodes(posB));

        List<String> categories = categories(posB, true).stream().map(ProductCategoryPayload::getCode)
                .filter(c -> c.startsWith("ITC")).toList();
        assertEquals(List.of("ITC1"), categories);
    }

    @Test
    void tillStockIsPerPos() {
        assertEquals(10, tillStock(posA), 1e-9);
        assertEquals(0, tillStock(posB), 1e-9);

        move(posB, "ENTRY", 5);
        assertEquals(10, tillStock(posA), 1e-9);
        assertEquals(5, tillStock(posB), 1e-9);

        move(posA, "LOSS", 2);
        move(posB, "SALE", 1);
        assertEquals(8, tillStock(posA), 1e-9);
        assertEquals(4, tillStock(posB), 1e-9);
    }

    @Test
    void adminListingsAreUnchanged() {
        assertTrue(products(posB, false).stream().noneMatch(p -> p.getCode().startsWith("ITP")));
        assertTrue(categories(posB, false).stream().noneMatch(c -> c.getCode().startsWith("ITC")));

        assertEquals(3, products(posA, false).stream().filter(p -> p.getCode().startsWith("ITP")).count());
        assertEquals(2, categories(posA, false).stream().filter(c -> c.getCode().startsWith("ITC")).count());
    }
}
