package com.mystore.manager.api.business.service.inter;

import com.mystore.manager.api.business.common.criteria.ProductCriteria;
import com.mystore.manager.api.business.model.ProductEntity;
import com.mystore.manager.api.business.payload.ProductPayload;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IProductService {

    ProductPayload save(ProductPayload payload);
    boolean delete(ProductPayload payload);
    boolean deleteById(Integer id);
    ProductPayload findById(Integer id);
    ProductEntity getEntity(Integer id);
    ProductEntity getByName(String name);
    ProductPayload update(ProductPayload payload);

    GlobalPayload<ProductPayload> findAllByCriteria(ProductCriteria criteria);

    List<ProductPayload> findAll();

    boolean uploadCsv(MultipartFile file) throws IOException;

    List<ProductPayload> deleteMultiple(List<ProductPayload> payloads);
}
