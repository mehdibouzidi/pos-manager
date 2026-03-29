package com.mystore.manager.api.admin.controller;

import com.mystore.manager.api.admin.criteria.PosCriteria;
import com.mystore.manager.api.admin.payload.PosPayload;
import com.mystore.manager.api.admin.service.inter.IPosService;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mystore.manager.api.admin.util.AdminConstants.POS_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@CrossOrigin
@RestController
@RequestMapping(POS_CONTROLLER)
public class PosController {

    @Autowired
    private IPosService service;

    @PostMapping(path = ADD_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PosPayload> add(@RequestBody PosPayload payload) {
        return new ResponseEntity<>(service.save(payload), HttpStatus.OK);
    }

    @PutMapping(path = UPDATE_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PosPayload> update(@RequestBody PosPayload payload) {
        return new ResponseEntity<>(service.edit(payload), HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Boolean> delete(@PathVariable Integer id) {
        return new ResponseEntity<>(service.deleteById(id), HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<PosPayload> get(@PathVariable Integer id) {
        return new ResponseEntity<>(service.findById(id), HttpStatus.OK);
    }

    @GetMapping(path = FIND_ALL_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<PosPayload>> findAll() {
        return new ResponseEntity<>(service.findAll(), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<PosPayload>> findByCriteria(@RequestBody PosCriteria criteria) {
        return new ResponseEntity<>(service.findByCriteria(criteria), HttpStatus.OK);
    }
}

