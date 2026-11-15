package com.mystore.manager.api.business.service.inter;

import com.mystore.manager.api.business.common.criteria.CaisseSessionCriteria;
import com.mystore.manager.api.business.payload.CaisseSessionAdminCloseRequest;
import com.mystore.manager.api.business.payload.CaisseSessionPayload;
import com.mystore.manager.api.business.payload.SalePayload;
import java.util.List;
import com.mystore.manager.api.common.payload.GlobalPayload;

public interface ICaisseSessionService {
    CaisseSessionPayload open(CaisseSessionPayload payload);
    CaisseSessionPayload close(CaisseSessionPayload payload);

    /** Admin: closes the selected (or all) OPEN sessions in the user's scope. */
    List<CaisseSessionPayload> closeFromAdmin(CaisseSessionAdminCloseRequest request);
    CaisseSessionPayload getCurrent();

    /** Sales (with their items) of a session, oldest first. */
    List<SalePayload> findSales(Integer sessionId);
    GlobalPayload<CaisseSessionPayload> findAllByCriteria(CaisseSessionCriteria criteria);
}
