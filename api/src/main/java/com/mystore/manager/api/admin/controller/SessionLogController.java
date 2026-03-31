package com.mystore.manager.api.admin.controller;

import com.mystore.manager.api.admin.criteria.SessionLogCriteria;
import com.mystore.manager.api.admin.payload.SessionLogPayload;
import com.mystore.manager.api.admin.service.inter.ISessionLogService;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mystore.manager.api.admin.util.AdminConstants.SESSION_LOG_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@CrossOrigin
@RestController
@RequestMapping(SESSION_LOG_CONTROLLER)
public class SessionLogController {

    @Autowired
    private ISessionLogService service;

    @GetMapping(value = ID_PARAM)
    public ResponseEntity<SessionLogPayload> get(@PathVariable Integer id) {
        return new ResponseEntity<>(service.findById(id), HttpStatus.OK);
    }

    @GetMapping(path = FIND_ALL_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<SessionLogPayload>> findAll() {
        return new ResponseEntity<>(service.findAll(), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<SessionLogPayload>> findByCriteria(@RequestBody SessionLogCriteria criteria) {
        return new ResponseEntity<>(service.findByCriteria(criteria), HttpStatus.OK);
    }
}
