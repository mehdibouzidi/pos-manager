package com.mystore.manager.api.business.service.inter;

import com.mystore.manager.api.business.common.criteria.CaisseSessionCriteria;
import com.mystore.manager.api.business.payload.CaisseSessionPayload;
import com.mystore.manager.api.common.payload.GlobalPayload;

public interface ICaisseSessionService {
    CaisseSessionPayload open(CaisseSessionPayload payload);
    CaisseSessionPayload close(CaisseSessionPayload payload);
    CaisseSessionPayload getCurrent();
    GlobalPayload<CaisseSessionPayload> findAllByCriteria(CaisseSessionCriteria criteria);
}
