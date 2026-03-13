package com.mystore.manager.api.business.payload;


import com.mystore.manager.api.common.payload.GlobalDataPayload;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.math.BigDecimal;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductPayload extends GlobalDataPayload {
    private Double maxStock;
    private Double minStock;
    private BigDecimal wholesalePrice; // Prix de Gros
    private BigDecimal retailPrice; // Prix détail de vente
    private BigDecimal currentStock; // Stock réel = achat - vente
}
