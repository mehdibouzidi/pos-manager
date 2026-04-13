package com.mystore.manager.api.business.controller;

import com.mystore.manager.api.business.payload.SalePayload;
import com.mystore.manager.api.business.service.inter.ISaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.mystore.manager.api.business.common.util.BusinessConstants.SALE_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@CrossOrigin
@RestController
@RequestMapping(SALE_CONTROLLER)
public class SaleController {

    @Autowired
    private ISaleService service;

    @PostMapping(path = ADD_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SalePayload> add(@RequestBody SalePayload payload) {
        return new ResponseEntity<>(service.save(payload), HttpStatus.OK);
    }

    @GetMapping(value = ID_PARAM, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SalePayload> get(@PathVariable Integer id) {
        return new ResponseEntity<>(service.findById(id), HttpStatus.OK);
    }
}
