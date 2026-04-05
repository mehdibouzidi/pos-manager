package com.mystore.manager.api.business.service.inter;

import com.mystore.manager.api.business.payload.DashboardPayload;

public interface IDashboardService {
    DashboardPayload getStats(String period);
}
