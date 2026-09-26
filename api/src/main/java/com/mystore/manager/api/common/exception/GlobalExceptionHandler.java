package com.mystore.manager.api.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Business errors not handled by a controller are returned as 400 with their message,
 * so that clients can tell a rejected operation (do not retry) from a server failure (retry).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CRUDException.class)
    public ResponseEntity<Map<String, String>> handleCrud(CRUDException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", String.valueOf(e.getMessage())));
    }
}
