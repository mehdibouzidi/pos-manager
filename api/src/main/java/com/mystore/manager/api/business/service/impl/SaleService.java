package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.business.common.mapper.SaleMapper;
import com.mystore.manager.api.business.model.CaisseSessionEntity;
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
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class SaleService implements ISaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final SaleMapper saleMapper;
    private final IStockMovementService stockMovementService;
    private final CaisseSessionRepository caisseSessionRepository;

    @Autowired
    public SaleService(SaleRepository saleRepository,
                       SaleItemRepository saleItemRepository,
                       ProductRepository productRepository,
                       SaleMapper saleMapper,
                       IStockMovementService stockMovementService,
                       CaisseSessionRepository caisseSessionRepository) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.productRepository = productRepository;
        this.saleMapper = saleMapper;
        this.stockMovementService = stockMovementService;
        this.caisseSessionRepository = caisseSessionRepository;
    }

    @Override
    @Transactional
    public SalePayload save(SalePayload payload) {
        Instant now = Instant.now();

        // Generate daily order number scoped to this POS terminal
        Integer posId = PosContext.getPosId();
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant startOfNextDay = startOfDay.plus(1, ChronoUnit.DAYS);
        int currentMax = (posId != null)
                ? saleRepository.findMaxOrderNumberByPosAndDate(posId, startOfDay, startOfNextDay)
                : saleRepository.findMaxOrderNumberByNoPosAndDate(startOfDay, startOfNextDay);
        int orderNumber = currentMax + 1;

        // Create sale
        SaleEntity sale = saleMapper.payloadToEntity(payload, new SaleEntity());
        sale.setOrderNumber(orderNumber);

        // Prefer the offline timestamp provided by the client; fall back to now
        Instant saleInstant = now;
        if (payload.getSaleDate() != null && !payload.getSaleDate().isBlank()) {
            try {
                saleInstant = Instant.parse(payload.getSaleDate());
            } catch (DateTimeParseException ignored) {
                // keep now
            }
        }
        sale.setSaleDate(saleInstant);
        if (sale.getPaymentMethod() == null) {
            sale.setPaymentMethod("CASH");
        }

        // Attach to the currently open caisse session
        if (posId != null) {
            caisseSessionRepository.findByPos_IdAndStatus(posId, "OPEN")
                    .ifPresent(sale::setCaisseSession);
        }

        sale = saleRepository.save(sale);

        // Process items
        List<SaleItemPayload> items = payload.getItems();
        if (items != null) {
            final SaleEntity savedSale = sale;
            for (SaleItemPayload itemPayload : items) {
                if (itemPayload.getProductId() == null) continue;
                productRepository.findById(itemPayload.getProductId()).ifPresent(product -> {
                    // Persist sale item
                    SaleItemEntity item = new SaleItemEntity();
                    item.setSale(savedSale);
                    item.setProduct(product);
                    item.setQuantity(itemPayload.getQuantity());
                    item.setUnitPrice(itemPayload.getUnitPrice());
                    saleItemRepository.save(item);

                    // Create SALE stock movement (also updates product.currentStock)
                    StockMovementPayload movPayload = new StockMovementPayload();
                    movPayload.setProductId(product.getId());
                    movPayload.setMovementType("SALE");
                    movPayload.setQuantity(itemPayload.getQuantity());
                    movPayload.setReason("Vente #" + savedSale.getOrderNumber());
                    stockMovementService.save(movPayload);
                });
            }
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
