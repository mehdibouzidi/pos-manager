package com.mystore.manager.api.admin.controller;


import com.mystore.manager.api.admin.criteria.PrivilegeCriteria;
import com.mystore.manager.api.admin.payload.PrivilegePayload;
import com.mystore.manager.api.admin.service.inter.IPrivilegeService;
import com.mystore.manager.api.common.exception.CRUDException;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mystore.manager.api.admin.util.AdminConstants.PRIVILEGE_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@CrossOrigin
@RestController
@RequestMapping(PRIVILEGE_CONTROLLER)
public class PrivilegeController {

    @Autowired
    private IPrivilegeService service;

    @PostMapping(path = ADD_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PrivilegePayload> add(
            @RequestBody PrivilegePayload payload
    ) {
        return new ResponseEntity(service.save(payload), HttpStatus.OK);
    }

    @PutMapping(path = UPDATE_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PrivilegePayload> update(
            @RequestBody PrivilegePayload payload
    ) {
        return new ResponseEntity(service.update(payload), HttpStatus.OK);
    }


    @DeleteMapping(value = "/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Integer id
    ) {
        try {
            return new ResponseEntity(service.deleteById(id), HttpStatus.OK);
        } catch (CRUDException exception) {
            return new ResponseEntity(exception.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<PrivilegePayload> get(
            @PathVariable Integer id
    ) {
        try {
            return new ResponseEntity(service.findById(id), HttpStatus.OK);
        } catch (CRUDException exception) {
            return new ResponseEntity(exception.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(path = FIND_ALL_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<PrivilegePayload>> findAllByBlogPostId() {
        return new ResponseEntity(service.findAll(), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<PrivilegePayload>> findAllByBlogPostId(
            @RequestBody PrivilegeCriteria criteria

    ) {
        return new ResponseEntity(service.findAllByCriteria(criteria), HttpStatus.OK);
    }
}
