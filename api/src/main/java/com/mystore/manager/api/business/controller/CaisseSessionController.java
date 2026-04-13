package com.mystore.manager.api.business.controller;

import com.mystore.manager.api.business.common.criteria.CaisseSessionCriteria;
import com.mystore.manager.api.business.payload.CaisseSessionPayload;
import com.mystore.manager.api.business.service.inter.ICaisseSessionService;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.mystore.manager.api.business.common.util.BusinessConstants.CAISSE_SESSION_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.FIND_ALL_BY_CRITERIA_EP;

@CrossOrigin
@RestController
@RequestMapping(CAISSE_SESSION_CONTROLLER)
public class CaisseSessionController {

    @Autowired
    private ICaisseSessionService service;

    @PostMapping(path = "/open", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CaisseSessionPayload> open(@RequestBody CaisseSessionPayload payload) {
        return new ResponseEntity<>(service.open(payload), HttpStatus.OK);
    }

    @PutMapping(path = "/close", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CaisseSessionPayload> close(@RequestBody CaisseSessionPayload payload) {
        return new ResponseEntity<>(service.close(payload), HttpStatus.OK);
    }

    @GetMapping(path = "/current", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CaisseSessionPayload> getCurrent() {
        return new ResponseEntity<>(service.getCurrent(), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<CaisseSessionPayload>> findAllByCriteria(@RequestBody CaisseSessionCriteria criteria) {
        return new ResponseEntity<>(service.findAllByCriteria(criteria), HttpStatus.OK);
    }
}
