package com.mystore.manager.api.business.controller;

import com.mystore.manager.api.business.payload.DashboardPayload;
import com.mystore.manager.api.business.service.inter.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.mystore.manager.api.business.common.util.BusinessConstants.DASHBOARD_CONTROLLER;

@CrossOrigin
@RestController
@RequestMapping(DASHBOARD_CONTROLLER)
public class DashboardController {

    private final IDashboardService dashboardService;

    @Autowired
    public DashboardController(IDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardPayload> getStats(
            @RequestParam(name = "period", defaultValue = "MONTH") String period) {
        return ResponseEntity.ok(dashboardService.getStats(period));
    }
}
