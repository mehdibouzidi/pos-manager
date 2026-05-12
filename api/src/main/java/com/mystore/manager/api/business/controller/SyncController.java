package com.mystore.manager.api.business.controller;

import com.mystore.manager.api.business.payload.SyncBatchRequestPayload;
import com.mystore.manager.api.business.payload.SyncBatchResultPayload;
import com.mystore.manager.api.business.service.inter.ISyncBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.mystore.manager.api.business.common.util.BusinessConstants.SYNC_CONTROLLER;

@CrossOrigin
@RestController
@RequestMapping(SYNC_CONTROLLER)
public class SyncController {

    @Autowired
    private ISyncBatchService service;

    @PostMapping(path = "/batch", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SyncBatchResultPayload> batch(@RequestBody SyncBatchRequestPayload payload) {
        return new ResponseEntity<>(service.process(payload), HttpStatus.OK);
    }
}
