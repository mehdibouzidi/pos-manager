package com.mystore.manager.api.business.service.impl;

import com.mystore.manager.api.admin.repository.PosRepository;
import com.mystore.manager.api.business.common.criteria.CaisseSessionCriteria;
import com.mystore.manager.api.business.common.mapper.CaisseSessionMapper;
import com.mystore.manager.api.business.common.mapper.SaleMapper;
import com.mystore.manager.api.business.payload.SalePayload;
import com.mystore.manager.api.business.common.util.BusinessConstants;
import com.mystore.manager.api.business.model.CaisseSessionEntity;
import com.mystore.manager.api.business.payload.CaisseSessionAdminCloseRequest;
import com.mystore.manager.api.business.payload.CaisseSessionPayload;
import com.mystore.manager.api.business.repository.CaisseSessionRepository;
import com.mystore.manager.api.business.repository.SaleRepository;
import com.mystore.manager.api.business.service.inter.ICaisseSessionService;
import com.mystore.manager.api.common.context.PosContext;
import com.mystore.manager.api.common.exception.CRUDException;
import com.mystore.manager.api.common.payload.GlobalPayload;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CaisseSessionService implements ICaisseSessionService {

    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_CLOSED = "CLOSED";

    private final CaisseSessionRepository repository;
    private final SaleRepository saleRepository;
    private final CaisseSessionMapper mapper;
    private final PosRepository posRepository;

    public static final String ALREADY_OPEN_MSG = "Une session de caisse est déjà ouverte pour ce terminal.";

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private SaleMapper saleMapper;

    @Autowired
    public CaisseSessionService(CaisseSessionRepository repository,
                                SaleRepository saleRepository,
                                CaisseSessionMapper mapper,
                                PosRepository posRepository) {
        this.repository = repository;
        this.saleRepository = saleRepository;
        this.mapper = mapper;
        this.posRepository = posRepository;
    }

    @Override
    @Transactional
    public CaisseSessionPayload open(CaisseSessionPayload payload) {
        Integer posId = PosContext.getPosId();

        if (posId != null) {
            posRepository.lockById(posId);
            // Idempotency: an open operation already received (sync retry) is returned as is
            if (hasText(payload.getLocalId())) {
                Optional<CaisseSessionEntity> same = repository.findByPos_IdAndLocalId(posId, payload.getLocalId());
                if (same.isPresent()) return mapper.entityToPayload(same.get());
            }
            Optional<CaisseSessionEntity> existing = repository.findByPos_IdAndStatus(posId, STATUS_OPEN);
            if (existing.isPresent()) {
                throw new CRUDException(ALREADY_OPEN_MSG);
            }
        }

        CaisseSessionEntity entity = mapper.payloadToEntity(payload, new CaisseSessionEntity());
        // Offline sessions are synced later: keep the real opening time sent by the till
        Instant openedAt = parseClientInstant(payload.getOpenedAt());
        entity.setOpenedAt(openedAt);
        entity.setStatus(STATUS_OPEN);
        entity.setLocalId(payload.getLocalId());

        // Capture first order number: next order number after current max of the business day
        Instant[] day = BusinessConstants.businessDayBounds(openedAt);
        int currentMax = (posId != null)
                ? saleRepository.findMaxOrderNumberByPosAndDate(posId, day[0], day[1])
                : 0;
        entity.setFirstOrderNumber(currentMax + 1);

        entity = repository.save(entity);
        return mapper.entityToPayload(entity);
    }

    @Override
    @Transactional
    public CaisseSessionPayload close(CaisseSessionPayload payload) {
        Integer posId = PosContext.getPosId();

        if (posId != null) {
            posRepository.lockById(posId);
            // Idempotency: a close operation already received (sync retry) is returned as is
            if (hasText(payload.getLocalId())) {
                Optional<CaisseSessionEntity> same = repository.findByPos_IdAndCloseLocalId(posId, payload.getLocalId());
                if (same.isPresent()) return mapper.entityToPayload(same.get());
            }
        }

        Optional<CaisseSessionEntity> sessionOpt = (posId != null)
                ? repository.findByPos_IdAndStatus(posId, STATUS_OPEN)
                : Optional.empty();

        if (sessionOpt.isEmpty()) {
            throw new CRUDException("Aucune session de caisse ouverte pour ce terminal.");
        }

        CaisseSessionEntity entity = sessionOpt.get();
        entity.setCloseLocalId(payload.getLocalId());
        entity = closeEntity(entity, parseClientInstant(payload.getClosedAt()), payload.getClosingBalance(), payload.getNotes());
        return mapper.entityToPayload(entity);
    }

    public static final String ADMIN_CLOSE_NOTE = "Clôturée depuis l'administration";

    @Override
    @Transactional
    public List<CaisseSessionPayload> closeFromAdmin(CaisseSessionAdminCloseRequest request) {
        boolean superAdmin = PosContext.isSuperAdmin();
        Integer posId = PosContext.getPosId();
        if (!superAdmin && posId == null) {
            throw new CRUDException("Aucun point de vente associé à cet utilisateur.");
        }

        List<CaisseSessionEntity> targets;
        if (request.isAll()) {
            targets = superAdmin ? repository.findAllByStatus(STATUS_OPEN) : repository.findAllByPos_IdAndStatus(posId, STATUS_OPEN);
        } else {
            if (request.getIds() == null || request.getIds().isEmpty()) {
                throw new CRUDException("Aucune caisse sélectionnée.");
            }
            targets = repository.findAllById(request.getIds()).stream()
                    // Other POS' sessions are invisible to a non-super-admin: silently out of scope
                    .filter(s -> superAdmin || (s.getPos() != null && posId.equals(s.getPos().getId())))
                    .filter(s -> STATUS_OPEN.equals(s.getStatus()))
                    .toList();
        }
        if (targets.isEmpty()) {
            throw new CRUDException("Aucune caisse ouverte à clôturer.");
        }
        // A counted amount only makes sense for one caisse; a bulk close leaves the balance "not counted"
        Double closingBalance = targets.size() == 1 ? request.getClosingBalance() : null;
        String extra = request.getNotes() != null && !request.getNotes().isBlank() ? " — " + request.getNotes().trim() : "";
        String notes = ADMIN_CLOSE_NOTE + (closingBalance == null ? " (montant non compté)" : "") + extra;

        List<CaisseSessionPayload> closed = new ArrayList<>();
        for (CaisseSessionEntity entity : targets) {
            if (entity.getPos() != null) posRepository.lockById(entity.getPos().getId());
            closed.add(mapper.entityToPayload(closeEntity(entity, Instant.now(), closingBalance, notes)));
        }
        return closed;
    }

    @Override
    @Transactional
    public List<SalePayload> findSales(Integer sessionId) {
        CaisseSessionEntity session = repository.findById(sessionId)
                .orElseThrow(() -> new CRUDException("Session de caisse introuvable."));
        if (!PosContext.isSuperAdmin()) {
            Integer posId = PosContext.getPosId();
            if (posId == null || session.getPos() == null || !posId.equals(session.getPos().getId())) {
                throw new CRUDException("Session de caisse introuvable.");
            }
        }
        return saleRepository.findAllByCaisseSession_IdOrderBySaleDateAscIdAsc(sessionId).stream()
                .map(saleMapper::entityToPayload)
                .toList();
    }

    /** Closes the session: totals and last order number from its own sales, variance when a balance is given. */
    private CaisseSessionEntity closeEntity(CaisseSessionEntity entity, Instant closedAt, Double closingBalance, String notes) {
        if (closedAt.isBefore(entity.getOpenedAt())) closedAt = Instant.now();
        entity.setClosedAt(closedAt);

        if (Objects.nonNull(closingBalance)) {
            entity.setClosingBalance(new BigDecimal(closingBalance.toString()));
        }
        if (Objects.nonNull(notes)) {
            entity.setNotes(notes.length() > 500 ? notes.substring(0, 500) : notes);
        }

        // Capture last order number from the session's own sales (a session may span midnight)
        entity.setLastOrderNumber(saleRepository.findMaxOrderNumberBySession(entity.getId()));

        // Compute sales totals using the session FK (reliable, no time-range guesswork)
        List<Object[]> totalsList = saleRepository.findSalesTotalsBySession(entity.getId());
        Object[] totals = (!totalsList.isEmpty()) ? totalsList.get(0) : new Object[]{0.0, 0L};
        double totalSalesAmount = (totals[0] != null) ? ((Number) totals[0]).doubleValue() : 0.0;
        long totalSalesCount   = (totals[1] != null) ? ((Number) totals[1]).longValue()   : 0L;
        entity.setTotalSalesAmount(BigDecimal.valueOf(totalSalesAmount));
        entity.setTotalSalesCount((int) totalSalesCount);

        // variance = closingBalance - (openingBalance + totalSalesAmount)
        if (Objects.nonNull(entity.getClosingBalance()) && Objects.nonNull(entity.getOpeningBalance())) {
            BigDecimal expected = entity.getOpeningBalance().add(BigDecimal.valueOf(totalSalesAmount));
            entity.setVariance(entity.getClosingBalance().subtract(expected));
        }

        entity.setStatus(STATUS_CLOSED);
        return repository.save(entity);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    /** Timestamp sent by the till (ISO-8601), falling back to now when absent, invalid or in the future. */
    private static Instant parseClientInstant(String value) {
        Instant now = Instant.now();
        if (!hasText(value)) return now;
        try {
            Instant parsed = Instant.parse(value);
            return parsed.isAfter(now) ? now : parsed;
        } catch (DateTimeParseException e) {
            return now;
        }
    }

    @Override
    @Transactional
    public CaisseSessionPayload getCurrent() {
        Integer posId = PosContext.getPosId();
        if (posId == null) return null;
        return repository.findByPos_IdAndStatus(posId, STATUS_OPEN)
                .map(entity -> {
                    CaisseSessionPayload payload = mapper.entityToPayload(entity);
                    // Compute live running totals (not persisted until close)
                    List<Object[]> totalsList = saleRepository.findSalesTotalsBySession(entity.getId());
                    if (!totalsList.isEmpty() && totalsList.get(0) != null) {
                        Object[] totals = totalsList.get(0);
                        payload.setTotalSalesAmount(totals[0] != null ? ((Number) totals[0]).doubleValue() : 0.0);
                        payload.setTotalSalesCount(totals[1] != null ? ((Number) totals[1]).intValue() : 0);
                    } else {
                        payload.setTotalSalesAmount(0.0);
                        payload.setTotalSalesCount(0);
                    }
                    return payload;
                })
                .orElse(null);
    }

    @Override
    public GlobalPayload<CaisseSessionPayload> findAllByCriteria(CaisseSessionCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<CaisseSessionEntity> cq = cb.createQuery(CaisseSessionEntity.class);
        Root<CaisseSessionEntity> root = cq.from(CaisseSessionEntity.class);

        List<Predicate> predicates = buildPredicates(cb, root, criteria);
        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.desc(root.get("openedAt")));

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<CaisseSessionEntity> countRoot = countQuery.from(CaisseSessionEntity.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, criteria);
        countQuery.select(cb.count(countRoot));
        countQuery.where(countPredicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        List<CaisseSessionEntity> entities = entityManager.createQuery(cq)
                .setFirstResult(criteria.getPages() * criteria.getSize())
                .setMaxResults(criteria.getSize())
                .getResultList();

        GlobalPayload<CaisseSessionPayload> result = new GlobalPayload<>();
        result.setElements(mapper.entityListToPayload(entities, false));
        result.setTotalNumberOfElements(total.intValue());
        return result;
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<CaisseSessionEntity> root, CaisseSessionCriteria criteria) {
        List<Predicate> predicates = new ArrayList<>();

        if (criteria.getPosId() != null) {
            predicates.add(cb.equal(root.get("pos").get("id"), criteria.getPosId()));
        } else if (!PosContext.isSuperAdmin()) {
            Integer posId = PosContext.getPosId();
            if (posId != null) predicates.add(cb.equal(root.get("pos").get("id"), posId));
        }

        if (criteria.getStatus() != null && !criteria.getStatus().isEmpty()) {
            predicates.add(cb.equal(root.get("status"), criteria.getStatus().toUpperCase()));
        }

        if (criteria.getFromDate() != null && !criteria.getFromDate().isEmpty()) {
            Instant from = LocalDate.parse(criteria.getFromDate()).atStartOfDay(ZoneOffset.UTC).toInstant();
            predicates.add(cb.greaterThanOrEqualTo(root.get("openedAt"), from));
        }

        if (criteria.getToDate() != null && !criteria.getToDate().isEmpty()) {
            Instant to = LocalDate.parse(criteria.getToDate()).plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
            predicates.add(cb.lessThan(root.get("openedAt"), to));
        }

        return predicates;
    }
}
