package com.mystore.manager.api.admin.controller;

import com.mystore.manager.api.admin.criteria.ApiKeyCriteria;
import com.mystore.manager.api.admin.payload.ApiKeyPayload;
import com.mystore.manager.api.admin.service.inter.IApiKeyService;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mystore.manager.api.admin.util.AdminConstants.API_KEY_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@CrossOrigin
@RestController
@RequestMapping(API_KEY_CONTROLLER)
public class ApiKeyController {

    @Autowired
    private IApiKeyService service;

    @PostMapping(path = ADD_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiKeyPayload> add(@RequestBody ApiKeyPayload payload) {
        return new ResponseEntity<>(service.save(payload), HttpStatus.OK);
    }

    @PutMapping(path = UPDATE_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiKeyPayload> update(@RequestBody ApiKeyPayload payload) {
        return new ResponseEntity<>(service.edit(payload), HttpStatus.OK);
    }

    @PostMapping(path = "regenerate" + ID_PARAM, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiKeyPayload> regenerate(@PathVariable Integer id) {
        return new ResponseEntity<>(service.regenerate(id), HttpStatus.OK);
    }

    @DeleteMapping(value = ID_PARAM)
    public ResponseEntity<Boolean> delete(@PathVariable Integer id) {
        return new ResponseEntity<>(service.deleteById(id), HttpStatus.OK);
    }

    @GetMapping(value = ID_PARAM)
    public ResponseEntity<ApiKeyPayload> get(@PathVariable Integer id) {
        return new ResponseEntity<>(service.findById(id), HttpStatus.OK);
    }

    @GetMapping(path = FIND_ALL_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ApiKeyPayload>> findAll() {
        return new ResponseEntity<>(service.findAll(), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<ApiKeyPayload>> findByCriteria(@RequestBody ApiKeyCriteria criteria) {
        return new ResponseEntity<>(service.findByCriteria(criteria), HttpStatus.OK);
    }
}
