package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.admin.repository.PosRepository;
import com.mystore.manager.api.business.common.mapper.SaleMapper;
import com.mystore.manager.api.business.common.util.BusinessConstants;
import com.mystore.manager.api.business.model.CaisseSessionEntity;
import com.mystore.manager.api.business.model.ProductEntity;
import com.mystore.manager.api.business.model.SaleEntity;
import com.mystore.manager.api.business.model.SaleItemEntity;
import com.mystore.manager.api.business.payload.SaleItemPayload;
import com.mystore.manager.api.business.payload.SalePayload;
import com.mystore.manager.api.business.payload.StockMovementPayload;
import com.mystore.manager.api.business.repository.CaisseSessionRepository;
import com.mystore.manager.api.business.repository.ProductRepository;
import com.mystore.manager.api.business.repository.SaleItemRepository;
import com.mystore.manager.api.business.repository.SaleRepository;
import com.mystore.manager.api.business.service.inter.ISaleService;
import com.mystore.manager.api.business.service.inter.IStockMovementService;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.exception.CRUDException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SaleService implements ISaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final SaleMapper saleMapper;
    private final IStockMovementService stockMovementService;
    private final CaisseSessionRepository caisseSessionRepository;
    private final PosRepository posRepository;

    @Autowired
    public SaleService(SaleRepository saleRepository,
                       SaleItemRepository saleItemRepository,
                       ProductRepository productRepository,
                       SaleMapper saleMapper,
                       IStockMovementService stockMovementService,
                       CaisseSessionRepository caisseSessionRepository,
                       PosRepository posRepository) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.productRepository = productRepository;
        this.saleMapper = saleMapper;
        this.stockMovementService = stockMovementService;
        this.caisseSessionRepository = caisseSessionRepository;
        this.posRepository = posRepository;
    }

    @Override
    @Transactional
    public SalePayload save(SalePayload payload) {
        Integer posId = PosContext.getPosId();

        // Serialise sales of the same terminal: order-number allocation and idempotency check
        // must not interleave (double click, sync retry, two concurrent flushes).
        if (posId != null) {
            posRepository.lockById(posId);
            // Idempotency: a sale already received with this client id is returned as is.
            if (payload.getLocalId() != null && !payload.getLocalId().isBlank()) {
                Optional<SaleEntity> existing = saleRepository.findByPos_IdAndLocalId(posId, payload.getLocalId());
                if (existing.isPresent()) {
                    return saleMapper.entityToPayload(existing.get());
                }
            }
        }

        if (payload.getPaymentMethod() != null && !"CASH".equalsIgnoreCase(payload.getPaymentMethod())) {
            throw new CRUDException("Seul le paiement en espèces est accepté.");
        }
        List<SaleItemPayload> items = payload.getItems() != null ? payload.getItems() : List.of();
        if (items.isEmpty()) {
            throw new CRUDException("Vente sans article.");
        }
        Map<Integer, ProductEntity> products = new HashMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (SaleItemPayload itemPayload : items) {
            if (itemPayload.getProductId() == null || itemPayload.getQuantity() == null
                    || itemPayload.getQuantity() <= 0 || itemPayload.getUnitPrice() == null) {
                throw new CRUDException("Ligne de vente invalide.");
            }
            ProductEntity product = productRepository.findById(itemPayload.getProductId())
                    .orElseThrow(() -> new CRUDException("Produit introuvable (id " + itemPayload.getProductId() + ")."));
            products.put(product.getId(), product);
            total = total.add(BigDecimal.valueOf(itemPayload.getUnitPrice())
                    .multiply(BigDecimal.valueOf(itemPayload.getQuantity())));
        }

        // Attach to the currently open caisse session — a sale outside a session would be missing from every Z report
        CaisseSessionEntity session = null;
        if (posId != null) {
            session = caisseSessionRepository.findByPos_IdAndStatus(posId, "OPEN")
                    .orElseThrow(() -> new CRUDException("Aucune session de caisse ouverte pour ce terminal."));
        }

        // Prefer the offline timestamp provided by the client; fall back to now
        Instant saleInstant = Instant.now();
        if (payload.getSaleDate() != null && !payload.getSaleDate().isBlank()) {
            try {
                saleInstant = Instant.parse(payload.getSaleDate());
            } catch (DateTimeParseException ignored) {
                // keep now
            }
        }

        // Daily order number scoped to this POS terminal, on the business day of the sale
        Instant[] day = BusinessConstants.businessDayBounds(saleInstant);
        int currentMax = (posId != null)
                ? saleRepository.findMaxOrderNumberByPosAndDate(posId, day[0], day[1])
                : saleRepository.findMaxOrderNumberByNoPosAndDate(day[0], day[1]);

        SaleEntity sale = saleMapper.payloadToEntity(payload, new SaleEntity());
        sale.setOrderNumber(currentMax + 1);
        sale.setSaleDate(saleInstant);
        sale.setLocalId(payload.getLocalId());
        sale.setLocalOrderNumber(payload.getLocalOrderNumber());
        // Total is recomputed from the lines, never trusted from the client
        sale.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP).doubleValue());
        // Business rule: the shop only accepts cash
        sale.setPaymentMethod("CASH");
        sale.setCaisseSession(session);
        sale = saleRepository.save(sale);

        for (SaleItemPayload itemPayload : items) {
            ProductEntity product = products.get(itemPayload.getProductId());
            SaleItemEntity item = new SaleItemEntity();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(itemPayload.getQuantity());
            item.setUnitPrice(itemPayload.getUnitPrice());
            saleItemRepository.save(item);
            sale.getItems().add(item);

            // Create SALE stock movement (also updates product.currentStock)
            StockMovementPayload movPayload = new StockMovementPayload();
            movPayload.setProductId(product.getId());
            movPayload.setMovementType("SALE");
            movPayload.setQuantity(itemPayload.getQuantity());
            movPayload.setReason("Vente #" + sale.getOrderNumber());
            stockMovementService.save(movPayload);
        }

        return saleMapper.entityToPayload(sale);
    }

    @Override
    public SalePayload findById(Integer id) {
        return saleRepository.findById(id)
                .map(saleMapper::entityToPayload)
                .orElse(null);
    }
}
