package com.mystore.manager.api.admin.controller;

import com.mystore.manager.api.admin.criteria.StoreCriteria;
import com.mystore.manager.api.admin.payload.StorePayload;
import com.mystore.manager.api.admin.service.inter.IStoreService;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mystore.manager.api.admin.util.AdminConstants.STORE_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@CrossOrigin
@RestController
@RequestMapping(STORE_CONTROLLER)
public class StoreController {

    @Autowired
    private IStoreService service;

    @PostMapping(path = ADD_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<StorePayload> add(@RequestBody StorePayload payload) {
        return new ResponseEntity<>(service.save(payload), HttpStatus.OK);
    }

    @PutMapping(path = UPDATE_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<StorePayload> update(@RequestBody StorePayload payload) {
        return new ResponseEntity<>(service.edit(payload), HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Boolean> delete(@PathVariable Integer id) {
        return new ResponseEntity<>(service.deleteById(id), HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<StorePayload> get(@PathVariable Integer id) {
        return new ResponseEntity<>(service.findById(id), HttpStatus.OK);
    }

    @GetMapping(path = FIND_ALL_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<StorePayload>> findAll() {
        return new ResponseEntity<>(service.findAll(), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<StorePayload>> findByCriteria(@RequestBody StoreCriteria criteria) {
        return new ResponseEntity<>(service.findByCriteria(criteria), HttpStatus.OK);
    }
}
