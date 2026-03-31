package com.mystore.manager.api.business.controller;

import com.mystore.manager.api.business.common.criteria.ProductCategoryCriteria;
import com.mystore.manager.api.business.payload.ProductCategoryPayload;
import com.mystore.manager.api.business.service.inter.IProductCategoryService;
import com.mystore.manager.api.common.exception.CRUDException;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mystore.manager.api.business.common.util.BusinessConstants.PRODUCT_CATEGORY_CONTROLLER;
import static com.mystore.manager.api.common.constant.CommonConstants.*;

@CrossOrigin
@RestController
@RequestMapping(PRODUCT_CATEGORY_CONTROLLER)
public class ProductCategoryController {

    @Autowired
    private IProductCategoryService service;

    @PostMapping(path = ADD_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductCategoryPayload> add(@RequestBody ProductCategoryPayload payload) {
        return new ResponseEntity<>(service.save(payload), HttpStatus.OK);
    }

    @PutMapping(path = UPDATE_EP, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductCategoryPayload> update(@RequestBody ProductCategoryPayload payload) {
        return new ResponseEntity<>(service.update(payload), HttpStatus.OK);
    }

    @DeleteMapping(value = ID_PARAM)
    public ResponseEntity<Boolean> delete(@PathVariable Integer id) {
        try {
            return new ResponseEntity<>(service.deleteById(id), HttpStatus.OK);
        } catch (CRUDException exception) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = ID_PARAM)
    public ResponseEntity<ProductCategoryPayload> get(@PathVariable Integer id) {
        try {
            return new ResponseEntity<>(service.findById(id), HttpStatus.OK);
        } catch (CRUDException exception) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(path = FIND_ALL_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ProductCategoryPayload>> findAll() {
        return new ResponseEntity<>(service.findAll(), HttpStatus.OK);
    }

    @PostMapping(path = FIND_ALL_BY_CRITERIA_EP, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GlobalPayload<ProductCategoryPayload>> findAllByCriteria(
            @RequestBody ProductCategoryCriteria criteria) {
        return new ResponseEntity<>(service.findAllByCriteria(criteria), HttpStatus.OK);
    }
}
