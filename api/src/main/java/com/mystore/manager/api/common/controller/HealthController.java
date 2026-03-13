package com.mystore.manager.api.common.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin
public class HealthController {

    @Value("${app.version:1.0.0-SNAPSHOT}")
    private String appVersion;

    @Value("${spring.application.name:MyStoreManagerAPI}")
    private String appName;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("application", appName);
        response.put("version", appVersion);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/version")
    public ResponseEntity<Map<String, String>> version() {
        Map<String, String> response = new HashMap<>();
        response.put("version", appVersion);
        response.put("application", appName);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
