package com.mystore.manager.api.business.payload;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * Closing caisse sessions from the admin UI (sessions left open by the tills).
 * Either {@code all = true} (every OPEN session in scope) or an explicit list of {@code ids}.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CaisseSessionAdminCloseRequest {
    private List<Integer> ids;
    private boolean all;
    /** Counted cash; only accepted when closing a single session. Null = not counted (no variance). */
    private Double closingBalance;
    private String notes;
}
