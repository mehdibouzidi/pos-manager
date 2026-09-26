package com.mystore.manager.api.business.common.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

public class BusinessConstants {

    // Schema Constants
    public static final String BUSINESS_SCH = "business";

    // Table Constants
    public static final String PRODUCT_TABLE = "data_product";
    public static final String PRODUCT_CATEGORY_TABLE = "data_product_category";

    // REST Constants
    public static final String PRODUCT_CONTROLLER = "product";
    public static final String PRODUCT_CATEGORY_CONTROLLER = "product-category";
    public static final String STOCK_MOVEMENT_TABLE = "data_stock_movement";
    public static final String STOCK_MOVEMENT_CONTROLLER = "stock-movement";

    public static final String SALE_TABLE = "data_sale";
    public static final String SALE_ITEM_TABLE = "data_sale_item";
    public static final String SALE_CONTROLLER = "sale";

    public static final String CAISSE_SESSION_TABLE = "data_caisse_session";
    public static final String CAISSE_SESSION_CONTROLLER = "caisse-session";

    public static final String DASHBOARD_CONTROLLER = "dashboard";

    public static final String SYNC_CONTROLLER = "sync";

    /** Business timezone: order numbers restart every day at local midnight, not UTC midnight. */
    public static final ZoneId BUSINESS_ZONE = ZoneId.of("Africa/Algiers");

    /** [start, end) of the business day containing the given instant. */
    public static Instant[] businessDayBounds(Instant instant) {
        LocalDate day = instant.atZone(BUSINESS_ZONE).toLocalDate();
        return new Instant[]{
                day.atStartOfDay(BUSINESS_ZONE).toInstant(),
                day.plusDays(1).atStartOfDay(BUSINESS_ZONE).toInstant()
        };
    }

}
