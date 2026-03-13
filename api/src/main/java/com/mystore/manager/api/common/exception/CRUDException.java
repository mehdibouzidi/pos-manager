package com.mystore.manager.api.common.exception;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CRUDException extends RuntimeException{
    public CRUDException(String message) {
        super(message);
    }
}
