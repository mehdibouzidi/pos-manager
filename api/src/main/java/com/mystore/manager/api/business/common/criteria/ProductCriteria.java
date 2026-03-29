package com.mystore.manager.api.business.common.criteria;

import com.mystore.manager.api.common.criteria.PaginationCriteria;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductCriteria extends PaginationCriteria {
    private Integer id;
    private String code;
    private String name;
    private Integer posId;

    public Map<String, String> toMap(){
        Map<String, String> columnsValues = new HashMap<>();
        if(Objects.nonNull(id)){
            columnsValues.put("id",id.toString());
        }
        if(Objects.nonNull(code)){
            columnsValues.put("code",code);
        }
        if(Objects.nonNull(name)){
            columnsValues.put("name",name);
        }
        if(Objects.nonNull(posId)){
            columnsValues.put("pos.id", posId.toString());
        }
        return columnsValues;
    }
}
