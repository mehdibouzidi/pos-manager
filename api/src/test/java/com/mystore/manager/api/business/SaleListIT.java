package com.mystore.manager.api.business;

import com.mystore.manager.api.business.common.criteria.SaleCriteria;
import com.mystore.manager.api.business.payload.SalePayload;
import com.mystore.manager.api.business.service.inter.ISaleService;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.payload.GlobalPayload;
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

/** Ticket list of the admin "Ventes" page. Against a real PostgreSQL, run explicitly like SyncBatchIT. */
@SpringBootTest
class SaleListIT {

    @Autowired private ISaleService saleService;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private TransactionTemplate tx;

    private Integer posA;
    private Integer posB;
    private Integer coffee;
    private Integer tea;

    @BeforeEach
    void setUp() {
        cleanUp();
        tx.executeWithoutResult(s -> {
            posA = newPos();
            posB = newPos();
            Integer drinks = jdbc.queryForObject(
                    "INSERT INTO business.data_product_category (code, name, pos_fk) VALUES ('ITSC1', 'Boissons', ?) RETURNING id", Integer.class, posA);
            coffee = jdbc.queryForObject(
                    "INSERT INTO business.data_product (code, name, category_fk, pos_fk) VALUES ('ITSP1', 'Café', ?, ?) RETURNING id", Integer.class, drinks, posA);
            tea = jdbc.queryForObject(
                    "INSERT INTO business.data_product (code, name, pos_fk) VALUES ('ITSP2', 'Thé', ?) RETURNING id", Integer.class, posA);
            Integer session = jdbc.queryForObject(
                    "INSERT INTO business.data_caisse_session (opened_at, opening_balance, status, pos_fk) VALUES (now(), 0, 'OPEN', ?) RETURNING id",
                    Integer.class, posA);
            // POS A: #1 coffee (dine in, yesterday), #2 tea (takeaway, printed offline as #7), #3 coffee + tea (takeaway)
            sale(posA, session, 1, null, "DINE_IN", "now() - interval '1 day'", coffee);
            sale(posA, session, 2, 7, "TAKEAWAY", "now()", tea);
            sale(posA, session, 3, null, "TAKEAWAY", "now()", coffee, tea);
            // POS B: one ticket, never visible to POS A
            sale(posB, null, 1, null, "DINE_IN", "now()", coffee);
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

    private void sale(Integer pos, Integer session, int number, Integer printed, String type, String date, Integer... products) {
        Integer id = jdbc.queryForObject(
                "INSERT INTO business.data_sale (order_number, local_order_number, order_type, sale_date, total_amount, payment_method, pos_fk, caisse_session_fk) "
                        + "VALUES (?, ?, ?, " + date + ", ?, 'CASH', ?, ?) RETURNING id",
                Integer.class, number, printed, type, 100.0 * products.length, pos, session);
        for (Integer product : products) {
            jdbc.update("INSERT INTO business.data_sale_item (sale_fk, product_fk, quantity, unit_price) VALUES (?, ?, 1, 100)", id, product);
        }
    }

    private void cleanUp() {
        tx.executeWithoutResult(s -> {
            jdbc.update("DELETE FROM business.data_sale_item WHERE product_fk IN (SELECT id FROM business.data_product WHERE code LIKE 'ITSP%')");
            jdbc.update("DELETE FROM business.data_sale WHERE pos_fk IN (SELECT id FROM admin.admin_pos WHERE code LIKE 'IT-%')");
            jdbc.update("DELETE FROM business.data_caisse_session WHERE pos_fk IN (SELECT id FROM admin.admin_pos WHERE code LIKE 'IT-%')");
            jdbc.update("DELETE FROM business.data_product WHERE code LIKE 'ITSP%'");
            jdbc.update("DELETE FROM business.data_product_category WHERE code LIKE 'ITSC%'");
            jdbc.update("DELETE FROM admin.admin_pos WHERE code LIKE 'IT-%'");
        });
    }

    private GlobalPayload<SalePayload> list(Integer pos, SaleCriteria criteria) {
        PosContext.setPosId(pos);
        return saleService.findAllByCriteria(criteria);
    }

    private static List<Integer> numbers(GlobalPayload<SalePayload> page) {
        return page.getElements().stream().map(SalePayload::getOrderNumber).toList();
    }

    @Test
    void listsTheTicketsOfTheUsersPos_newestFirst_withTheirLines() {
        GlobalPayload<SalePayload> page = list(posA, new SaleCriteria());
        assertEquals(3, page.getTotalNumberOfElements());
        assertEquals(List.of(3, 2, 1), numbers(page));

        SalePayload last = page.getElements().get(0);
        assertEquals("TAKEAWAY", last.getOrderType());
        assertEquals(List.of("Café", "Thé"), last.getItems().stream().map(i -> i.getProductName()).sorted().toList());
        assertNotNull(last.getCaisseSessionId());
        assertEquals("OPEN", last.getCaisseSessionStatus());

        assertEquals(List.of(1), numbers(list(posB, new SaleCriteria())));
    }

    @Test
    void filters() {
        SaleCriteria takeaway = new SaleCriteria();
        takeaway.setOrderType("takeaway");
        assertEquals(List.of(3, 2), numbers(list(posA, takeaway)));

        SaleCriteria withCoffee = new SaleCriteria();
        withCoffee.setProductId(coffee);
        assertEquals(List.of(3, 1), numbers(list(posA, withCoffee)));

        SaleCriteria printedNumber = new SaleCriteria();
        printedNumber.setOrderNumber(7);
        assertEquals(List.of(2), numbers(list(posA, printedNumber)));

        SaleCriteria today = new SaleCriteria();
        String day = java.time.LocalDate.now(java.time.ZoneId.of("Africa/Algiers")).toString();
        today.setFromDate(day);
        today.setToDate(day);
        assertEquals(List.of(3, 2), numbers(list(posA, today)));
    }

    @Test
    void paginates() {
        SaleCriteria criteria = new SaleCriteria();
        criteria.setSize(2);
        criteria.setPages(1);
        GlobalPayload<SalePayload> page = list(posA, criteria);
        assertEquals(3, page.getTotalNumberOfElements());
        assertEquals(List.of(1), numbers(page));
    }
}
