package com.mystore.manager.api.business.controller;


import com.mystore.manager.api.business.common.criteria.ProductCriteria;
import com.mystore.manager.api.business.payload.ProductPayload;
import com.mystore.manager.api.common.payload.GlobalPayload;
import com.mystore.manager.api.business.service.inter.IProductService;
import com.mystore.manager.api.common.exception.CRUDException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static com.mystore.manager.api.business.common.util.BusinessConstants.PRODUCT_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@CrossOrigin
@RestController
@RequestMapping(PRODUCT_CONTROLLER)
public class ProductController {

    @Autowired
    private IProductService service;

    @PostMapping(path = ADD_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductPayload> add(
            @RequestBody ProductPayload payload
    ) {
        return new ResponseEntity(service.save(payload), HttpStatus.OK);
    }

    @PutMapping(path = UPDATE_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductPayload> update(
            @RequestBody ProductPayload payload
    ) {
        try {
            return new ResponseEntity(service.update(payload), HttpStatus.OK);
        } catch (CRUDException exception) {
            return new ResponseEntity(exception.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
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

    @DeleteMapping(path = "/deleteids", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Integer> deleteMultiple(
            @RequestBody List<ProductPayload> payloads) {
        try {
            return new ResponseEntity(service.deleteMultiple(payloads), HttpStatus.OK);
        } catch (CRUDException exception) {
            return new ResponseEntity(exception.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ProductPayload> get(
            @PathVariable Integer id
    ) {
        try {
            return new ResponseEntity(service.findById(id), HttpStatus.OK);
        } catch (CRUDException exception) {
            return new ResponseEntity(exception.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(path = FIND_ALL_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProductPayload>> findAllByBlogPostId() {
        return new ResponseEntity(service.findAll(), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<ProductPayload>> findAllByBlogPostId(
            @RequestBody ProductCriteria criteria

    ) {
        return new ResponseEntity(service.findAllByCriteria(criteria), HttpStatus.OK);
    }

    @PostMapping(path = IMPORT, consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProductPayload>> uploadCsv(@RequestParam("file") MultipartFile file) {
        try {
            return new ResponseEntity(service.uploadCsv(file), HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
