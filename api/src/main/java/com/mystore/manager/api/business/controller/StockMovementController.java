package com.mystore.manager.api.business.controller;

import com.mystore.manager.api.business.common.criteria.StockMovementCriteria;
import com.mystore.manager.api.business.payload.StockMovementPayload;
import com.mystore.manager.api.business.service.inter.IStockMovementService;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mystore.manager.api.business.common.util.BusinessConstants.STOCK_MOVEMENT_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@CrossOrigin
@RestController
@RequestMapping(STOCK_MOVEMENT_CONTROLLER)
public class StockMovementController {

    @Autowired
    private IStockMovementService service;

    @PostMapping(path = ADD_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<StockMovementPayload> add(@RequestBody StockMovementPayload payload) {
        return new ResponseEntity<>(service.save(payload), HttpStatus.OK);
    }

    @PutMapping(path = UPDATE_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<StockMovementPayload> update(@RequestBody StockMovementPayload payload) {
        return new ResponseEntity<>(service.update(payload), HttpStatus.OK);
    }

    @DeleteMapping(value = ID_PARAM)
    public ResponseEntity<Boolean> delete(@PathVariable Integer id) {
        return new ResponseEntity<>(service.deleteById(id), HttpStatus.OK);
    }

    @GetMapping(value = ID_PARAM)
    public ResponseEntity<StockMovementPayload> get(@PathVariable Integer id) {
        return new ResponseEntity<>(service.findById(id), HttpStatus.OK);
    }

    @GetMapping(path = FIND_ALL_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<StockMovementPayload>> findAll() {
        return new ResponseEntity<>(service.findAll(), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<StockMovementPayload>> findByCriteria(@RequestBody StockMovementCriteria criteria) {
        return new ResponseEntity<>(service.findAllByCriteria(criteria), HttpStatus.OK);
    }
}
