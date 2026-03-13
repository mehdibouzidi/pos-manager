package com.mystore.manager.api.admin.criteria;


import com.mystore.manager.api.common.criteria.PaginationCriteria;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserCriteria extends PaginationCriteria {
    private Integer id;
    private String firstName;
    private String lastName;
    private Integer serviceId;
    private Integer positionId;


    public Map<String, String> toMap(){
        Map<String, String> columnsValues = new HashMap<>();
        if(Objects.nonNull(id)){
            columnsValues.put("id",id.toString());
        }
        if(Objects.nonNull(firstName)){
            columnsValues.put("firstName",firstName);
        }
        if(Objects.nonNull(lastName)){
            columnsValues.put("lastName",lastName);
        }

        if(Objects.nonNull(serviceId)){
            columnsValues.put("service.id",serviceId.toString());
        }

        if(Objects.nonNull(positionId)){
            columnsValues.put("position.id",positionId.toString());
        }

        return columnsValues;
    }
}
