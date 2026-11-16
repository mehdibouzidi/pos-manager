package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.business.common.criteria.StockMovementCriteria;
import com.mystore.manager.api.business.common.mapper.StockMovementMapper;
import com.mystore.manager.api.business.model.ProductEntity;
import com.mystore.manager.api.business.model.SaleEntity;
import com.mystore.manager.api.business.model.StockMovementEntity;
import com.mystore.manager.api.business.payload.StockMovementPayload;
import com.mystore.manager.api.business.repository.ProductRepository;
import com.mystore.manager.api.business.repository.StockMovementRepository;
import com.mystore.manager.api.business.service.inter.IStockMovementService;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.exception.CRUDException;
import com.mystore.manager.api.common.payload.GlobalPayload;
import jakarta.persistence.EntityManager;
import java.time.ZoneId;
import java.time.LocalDate;
import java.time.Instant;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class StockMovementService implements IStockMovementService {

    private static final ZoneId LOCAL_ZONE = ZoneId.of("Africa/Algiers");

    private final StockMovementRepository repository;
    private final ProductRepository productRepository;
    private final StockMovementMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public StockMovementService(StockMovementRepository repository, ProductRepository productRepository, StockMovementMapper mapper) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public StockMovementPayload save(StockMovementPayload payload) {
        validate(payload);
        StockMovementEntity entity = mapper.payloadToEntity(payload, new StockMovementEntity());
        ProductEntity product = productRepository.findById(payload.getProductId())
                .orElseThrow(() -> new CRUDException("Produit introuvable (id " + payload.getProductId() + ")."));
        entity.setProduct(product);
        entity.setPos(resolvePos(payload.getPosId()));
        if (payload.getSaleId() != null) entity.setSale(entityManager.getReference(SaleEntity.class, payload.getSaleId()));
        entity = repository.save(entity);
        applyToStock(product.getId(), entity.getMovementType(), entity.getQuantity(), 1);
        return mapper.entityToPayload(entity);
    }

    @Override
    @Transactional
    public StockMovementPayload update(StockMovementPayload payload) {
        Optional<StockMovementEntity> entityOpt = repository.findById(payload.getId());
        if (entityOpt.isEmpty()) return null;
        StockMovementEntity entity = entityOpt.get();
        if (isSale(entity.getMovementType())) {
            throw new CRUDException("Un mouvement issu d'une vente ne peut pas être modifié.");
        }
        // Cancel the previous effect on stock, then apply the new one (quantity, type or product may change)
        Integer oldProductId = entity.getProduct() != null ? entity.getProduct().getId() : null;
        applyToStock(oldProductId, entity.getMovementType(), entity.getQuantity(), -1);

        entity = mapper.payloadToEntity(payload, entity);
        Integer oldPosId = entity.getPos() != null ? entity.getPos().getId() : null;
        if (payload.getPosId() != null && !payload.getPosId().equals(oldPosId)) {
            entity.setPos(resolvePos(payload.getPosId()));
        }
        if (payload.getProductId() != null && !payload.getProductId().equals(oldProductId)) {
            entity.setProduct(productRepository.findById(payload.getProductId())
                    .orElseThrow(() -> new CRUDException("Produit introuvable (id " + payload.getProductId() + ").")));
        }
        if (entity.getQuantity() == null || entity.getQuantity() <= 0) {
            throw new CRUDException("La quantité doit être strictement positive.");
        }
        entity = repository.save(entity);
        applyToStock(entity.getProduct() != null ? entity.getProduct().getId() : null,
                entity.getMovementType(), entity.getQuantity(), 1);
        return mapper.entityToPayload(entity);
    }

    @Override
    @Transactional
    public boolean deleteById(Integer id) {
        Optional<StockMovementEntity> entityOpt = repository.findById(id);
        if (entityOpt.isEmpty()) return false;
        StockMovementEntity entity = entityOpt.get();
        if (isSale(entity.getMovementType())) {
            throw new CRUDException("Un mouvement issu d'une vente ne peut pas être supprimé.");
        }
        // Deleting a movement cancels its effect on the product stock
        applyToStock(entity.getProduct() != null ? entity.getProduct().getId() : null,
                entity.getMovementType(), entity.getQuantity(), -1);
        repository.delete(entity);
        return true;
    }

    @Override
    public StockMovementPayload findById(Integer id) {
        return repository.findById(id)
                .map(mapper::entityToPayload)
                .orElse(null);
    }

    @Override
    public List<StockMovementPayload> findAll() {
        List<StockMovementEntity> entities;
        if (PosContext.isSuperAdmin()) {
            entities = repository.findAll();
        } else {
            Integer posId = PosContext.getPosId();
            entities = posId != null ? repository.findAllByPos_Id(posId) : List.of();
        }
        return mapper.entityListToPayload(entities, false);
    }

    @Override
    public GlobalPayload<StockMovementPayload> findAllByCriteria(StockMovementCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<StockMovementEntity> cq = cb.createQuery(StockMovementEntity.class);
        Root<StockMovementEntity> root = cq.from(StockMovementEntity.class);

        List<Predicate> predicates = buildPredicates(cb, root, criteria);
        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.desc(root.get("createdAt")));

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<StockMovementEntity> countRoot = countQuery.from(StockMovementEntity.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, criteria);
        countQuery.select(cb.count(countRoot));
        countQuery.where(countPredicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        List<StockMovementEntity> entities = entityManager.createQuery(cq)
                .setFirstResult(criteria.getPages() * criteria.getSize())
                .setMaxResults(criteria.getSize())
                .getResultList();

        GlobalPayload<StockMovementPayload> result = new GlobalPayload<>();
        result.setElements(mapper.entityListToPayload(entities, false));
        result.setTotalNumberOfElements(total.intValue());
        return result;
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<StockMovementEntity> root, StockMovementCriteria criteria) {
        List<Predicate> predicates = new ArrayList<>();
        if (criteria.getId() != null) predicates.add(cb.equal(root.get("id"), criteria.getId()));
        if (criteria.getProductId() != null) predicates.add(cb.equal(root.get("product").get("id"), criteria.getProductId()));
        if (criteria.getCategoryId() != null) predicates.add(cb.equal(root.get("product").get("category").get("id"), criteria.getCategoryId()));
        if (criteria.getPosId() != null) {
            predicates.add(cb.equal(root.get("pos").get("id"), criteria.getPosId()));
        } else if (!PosContext.isSuperAdmin()) {
            Integer posId = PosContext.getPosId();
            if (posId != null) predicates.add(cb.equal(root.get("pos").get("id"), posId));
        }
        if (criteria.getMovementType() != null && !criteria.getMovementType().isEmpty()) {
            predicates.add(cb.equal(root.get("movementType"), criteria.getMovementType().toUpperCase()));
        }
        // Whole local days (Algiers time), both bounds inclusive
        if (criteria.getFromDate() != null && !criteria.getFromDate().isBlank()) {
            Instant from = LocalDate.parse(criteria.getFromDate()).atStartOfDay(LOCAL_ZONE).toInstant();
            predicates.add(cb.greaterThanOrEqualTo(root.get("movementDate"), from));
        }
        if (criteria.getToDate() != null && !criteria.getToDate().isBlank()) {
            Instant to = LocalDate.parse(criteria.getToDate()).plusDays(1).atStartOfDay(LOCAL_ZONE).toInstant();
            predicates.add(cb.lessThan(root.get("movementDate"), to));
        }
        if (criteria.getCaisseSessionId() != null) {
            predicates.add(cb.equal(root.get("sale").get("caisseSession").get("id"), criteria.getCaisseSessionId()));
        }
        if (criteria.getReason() != null && !criteria.getReason().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("reason")), "%" + criteria.getReason().toLowerCase() + "%"));
        }
        return predicates;
    }

    private static void validate(StockMovementPayload payload) {
        if (payload.getProductId() == null) throw new CRUDException("Produit obligatoire.");
        if (payload.getMovementType() == null || payload.getMovementType().isBlank()) throw new CRUDException("Type de mouvement obligatoire.");
        if (payload.getQuantity() == null || payload.getQuantity() <= 0) throw new CRUDException("La quantité doit être strictement positive.");
    }

    /**
     * POS the movement belongs to: it decides which till sees the stock. A super admin chooses any POS,
     * other users only their own; without a choice, the POS of the connected user.
     */
    private PosEntity resolvePos(Integer requestedPosId) {
        Integer ownPosId = PosContext.getPosId();
        if (requestedPosId != null && !requestedPosId.equals(ownPosId) && !PosContext.isSuperAdmin()) {
            throw new CRUDException("Vous ne pouvez enregistrer un mouvement que pour votre point de vente.");
        }
        Integer posId = requestedPosId != null ? requestedPosId : ownPosId;
        if (posId == null) throw new CRUDException("Point de vente obligatoire.");
        PosEntity pos = entityManager.find(PosEntity.class, posId);
        if (pos == null) throw new CRUDException("Point de vente introuvable (id " + posId + ").");
        return pos;
    }

    private static boolean isSale(String movementType) {
        return "SALE".equalsIgnoreCase(movementType);
    }

    /** Effect of a movement on stock: ENTRY adds, LOSS and SALE remove, other types (ADJUSTMENT…) do not change it. */
    private static double signedQuantity(String movementType, Double quantity) {
        if (movementType == null || quantity == null) return 0;
        return switch (movementType.toUpperCase()) {
            case "ENTRY" -> quantity;
            case "LOSS", "SALE" -> -quantity;
            default -> 0;
        };
    }

    /** direction = 1 to apply the movement, -1 to cancel it. */
    private void applyToStock(Integer productId, String movementType, Double quantity, int direction) {
        double delta = direction * signedQuantity(movementType, quantity);
        if (productId == null || delta == 0) return;
        productRepository.addToStock(productId, delta);
    }
}
