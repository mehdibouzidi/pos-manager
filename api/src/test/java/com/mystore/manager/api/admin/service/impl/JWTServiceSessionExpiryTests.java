package com.mystore.manager.api.admin.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JWTServiceSessionExpiryTests {

    private final JWTService service = new JWTService();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "sessionCutoffHour", 4);
        ReflectionTestUtils.setField(service, "sessionZone", "Africa/Algiers"); // UTC+1, no DST
    }

    @Test
    void morningLoginEndsNextNightAtCutoff() {
        // 10:14 local
        assertEquals(Instant.parse("2026-11-16T03:00:00Z"),
                service.computeSessionExpiry(Instant.parse("2026-11-15T09:14:00Z")));
    }

    @Test
    void loginAfterMidnightBeforeCutoffEndsSameNightCutoff() {
        // 01:00 local → 04:00 local the same night
        assertEquals(Instant.parse("2026-11-16T03:00:00Z"),
                service.computeSessionExpiry(Instant.parse("2026-11-16T00:00:00Z")));
    }

    @Test
    void loginJustBeforeCutoffIsCarriedToNextDay() {
        // 03:30 local: less than 1h before the cutoff → next day's cutoff
        assertEquals(Instant.parse("2026-11-17T03:00:00Z"),
                service.computeSessionExpiry(Instant.parse("2026-11-16T02:30:00Z")));
    }
}
