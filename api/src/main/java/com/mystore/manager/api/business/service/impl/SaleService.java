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
import com.mystore.manager.api.business.common.criteria.SaleCriteria;
import com.mystore.manager.api.common.exception.CRUDException;
import com.mystore.manager.api.common.payload.GlobalPayload;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
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

    @PersistenceContext
    private EntityManager entityManager;

    /** Columns the ticket list may be sorted on (anything else falls back to the sale date). */
    private static final List<String> SORTABLE = List.of("saleDate", "orderNumber", "totalAmount", "orderType");

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
        // Optional so that a till still running an older version keeps selling
        String orderType = payload.getOrderType() == null || payload.getOrderType().isBlank()
                ? null : payload.getOrderType().trim().toUpperCase();
        if (orderType != null && !"DINE_IN".equals(orderType) && !"TAKEAWAY".equals(orderType)) {
            throw new CRUDException("Type de commande invalide.");
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
        sale.setOrderType(orderType);
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
            movPayload.setSaleId(sale.getId());
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

    @Override
    @Transactional
    public GlobalPayload<SalePayload> findAllByCriteria(SaleCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<SaleEntity> cq = cb.createQuery(SaleEntity.class);
        Root<SaleEntity> root = cq.from(SaleEntity.class);
        cq.where(predicates(cb, cq, root, criteria).toArray(new Predicate[0]));
        String column = criteria.getSortColumn() != null && SORTABLE.contains(criteria.getSortColumn()) ? criteria.getSortColumn() : "saleDate";
        boolean asc = "ASC".equalsIgnoreCase(criteria.getSort());
        cq.orderBy(asc ? cb.asc(root.get(column)) : cb.desc(root.get(column)),
                asc ? cb.asc(root.get("id")) : cb.desc(root.get("id")));

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<SaleEntity> countRoot = countQuery.from(SaleEntity.class);
        countQuery.select(cb.count(countRoot)).where(predicates(cb, countQuery, countRoot, criteria).toArray(new Predicate[0]));
        long total = entityManager.createQuery(countQuery).getSingleResult();

        // Amount of every ticket matching the filters, whatever the page shown
        CriteriaQuery<Double> sumQuery = cb.createQuery(Double.class);
        Root<SaleEntity> sumRoot = sumQuery.from(SaleEntity.class);
        sumQuery.select(cb.coalesce(cb.sum(sumRoot.<Double>get("totalAmount")), 0d))
                .where(predicates(cb, sumQuery, sumRoot, criteria).toArray(new Predicate[0]));
        Double totalAmount = entityManager.createQuery(sumQuery).getSingleResult();

        int size = criteria.getSize() != null && criteria.getSize() > 0 ? Math.min(criteria.getSize(), 200) : 10;
        int page = criteria.getPages() != null && criteria.getPages() > 0 ? criteria.getPages() : 0;
        List<SaleEntity> entities = entityManager.createQuery(cq)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();

        GlobalPayload<SalePayload> result = new GlobalPayload<>();
        result.setElements(saleMapper.entityListToPayload(entities));
        result.setTotalNumberOfElements((int) total);
        result.setTotalNumberOfPages((int) ((total + size - 1) / size));
        result.setTotalAmount(totalAmount);
        return result;
    }

    private List<Predicate> predicates(CriteriaBuilder cb, CriteriaQuery<?> query, Root<SaleEntity> root, SaleCriteria criteria) {
        List<Predicate> predicates = new ArrayList<>();
        // Sales are operational data: a user only sees the tickets of their own POS (super admin: all of them)
        if (criteria.getPosId() != null) {
            predicates.add(cb.equal(root.get("pos").get("id"), criteria.getPosId()));
        }
        if (!PosContext.isSuperAdmin()) {
            Integer posId = PosContext.getPosId();
            predicates.add(posId != null ? cb.equal(root.get("pos").get("id"), posId) : cb.disjunction());
        }
        if (criteria.getCaisseSessionId() != null) {
            predicates.add(cb.equal(root.get("caisseSession").get("id"), criteria.getCaisseSessionId()));
        }
        if (criteria.getOrderType() != null && !criteria.getOrderType().isBlank()) {
            predicates.add(cb.equal(root.get("orderType"), criteria.getOrderType().trim().toUpperCase()));
        }
        if (criteria.getOrderNumber() != null) {
            predicates.add(cb.or(cb.equal(root.get("orderNumber"), criteria.getOrderNumber()),
                    cb.equal(root.get("localOrderNumber"), criteria.getOrderNumber())));
        }
        if (criteria.getProductId() != null || criteria.getCategoryId() != null) {
            Subquery<Integer> items = query.subquery(Integer.class);
            Root<SaleItemEntity> item = items.from(SaleItemEntity.class);
            List<Predicate> itemPredicates = new ArrayList<>();
            itemPredicates.add(cb.equal(item.get("sale"), root));
            if (criteria.getProductId() != null) {
                itemPredicates.add(cb.equal(item.get("product").get("id"), criteria.getProductId()));
            }
            if (criteria.getCategoryId() != null) {
                itemPredicates.add(cb.equal(item.get("product").get("category").get("id"), criteria.getCategoryId()));
            }
            items.select(item.get("id")).where(itemPredicates.toArray(new Predicate[0]));
            predicates.add(cb.exists(items));
        }
        // Whole local days (Algiers time), both bounds inclusive
        if (criteria.getFromDate() != null && !criteria.getFromDate().isBlank()) {
            Instant from = LocalDate.parse(criteria.getFromDate()).atStartOfDay(BusinessConstants.BUSINESS_ZONE).toInstant();
            predicates.add(cb.greaterThanOrEqualTo(root.get("saleDate"), from));
        }
        if (criteria.getToDate() != null && !criteria.getToDate().isBlank()) {
            Instant to = LocalDate.parse(criteria.getToDate()).plusDays(1).atStartOfDay(BusinessConstants.BUSINESS_ZONE).toInstant();
            predicates.add(cb.lessThan(root.get("saleDate"), to));
        }
        return predicates;
    }
}
