package com.mystore.manager.api.common.util;

import com.mystore.manager.api.common.constant.CommonConstants;
import com.mystore.manager.api.common.context.StoreContext;
import com.mystore.manager.api.common.criteria.PaginationCriteria;
import com.mystore.manager.api.common.mapper.IMapper;
import com.mystore.manager.api.common.payload.GlobalPayload;
import org.apache.logging.log4j.util.Strings;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class CommonUtil {

    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final List<String> notNumberColumns = Arrays.asList("code", "name", "description", "notes");
    public static final String START_DATE = "startDate";
    public static final String END_DATE = "endDate";
    public static final String DATE = "date";

    private static final float DEFAULT_PDF_COMPRESSION_QUALITY = 0.6f;

    public static String composeFullName(String firstName, String lastName) {
        boolean hasFirstName = !Strings.isBlank(firstName);
        boolean hasLastName = !Strings.isBlank(lastName);

        if (!hasFirstName && !hasLastName) {
            return Strings.EMPTY;
        }

        if (!hasFirstName) {
            return lastName;
        }

        if (!hasLastName) {
            return firstName;
        }

        return firstName + " " + lastName;
    }

    public static byte[] multipartFileToBytes(MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            try {
                byte[] fileBytes = file.getBytes();
                if (MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(file.getContentType())) {
                    return compressPdf(fileBytes, DEFAULT_PDF_COMPRESSION_QUALITY);
                }
                return fileBytes;
            } catch (IOException e) {
                return null;
            }
        }
        return null;
    }

    public static byte[] compressPdf(byte[] pdfBytes, float imageQuality) {
        if (Objects.isNull(pdfBytes) || pdfBytes.length == 0) {
            return pdfBytes;
        }

        try (PDDocument document = PDDocument.load(pdfBytes)) {
            for (PDPage page : document.getPages()) {
                PDResources resources = page.getResources();
                if (Objects.isNull(resources)) {
                    continue;
                }
                for (COSName xObjectName : resources.getXObjectNames()) {
                    try {
                        PDXObject xObject = resources.getXObject(xObjectName);
                        if (xObject instanceof PDImageXObject) {
                            PDImageXObject imageXObject = (PDImageXObject) xObject;
                            BufferedImage originalImage = imageXObject.getImage();
                            if (Objects.isNull(originalImage)) {
                                continue;
                            }
                            BufferedImage rgbImage = new BufferedImage(originalImage.getWidth(), originalImage.getHeight(), BufferedImage.TYPE_INT_RGB);
                            Graphics2D graphics = rgbImage.createGraphics();
                            try {
                                graphics.drawImage(originalImage, 0, 0, null);
                            } finally {
                                graphics.dispose();
                            }
                            PDImageXObject compressedImage = JPEGFactory.createFromImage(document, rgbImage, imageQuality);
                            resources.put(xObjectName, compressedImage);
                        }
                    } catch (IOException ignored) {
                        // If we can't read or rewrite the image, keep the original one
                    }
                }
            }
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            byte[] compressedBytes = outputStream.toByteArray();
            return compressedBytes.length < pdfBytes.length ? compressedBytes : pdfBytes;
        } catch (IOException e) {
            return pdfBytes;
        }
    }

    public static Integer calculateNumberOfPages(Integer totalNumberOfElements, Integer numberOfEltsPerPage) {
        if (Objects.isNull(totalNumberOfElements) || totalNumberOfElements <= 0) {
            return 0;
        }

        if (Objects.isNull(numberOfEltsPerPage) || numberOfEltsPerPage <= 0) {
            return 1;
        }

        double doubleDiv = (double) totalNumberOfElements / (double) numberOfEltsPerPage;
        Integer numberOfPages = (int) doubleDiv;
        if (doubleDiv - (double) numberOfPages > 0) {
            numberOfPages += 1;
        }
        return numberOfPages;
    }

    public static String cleanQueryConditions(String query) {
        if (query.substring(query.length() - 4, query.length()).contains("AND")) {
            query = query.substring(0, query.length() - 4);
        }
        return query;
    }

    public static String selectCritQueryBuilderWithoutSort(String entityName, Map<String, String> columnsValues, PaginationCriteria criteria ) {
        return selectCritQueryBuilderWithoutSort(entityName, columnsValues, criteria, true);
    }
    
    /**
     * Build a JPQL query with optional store filtering.
     * @param entityName The entity name
     * @param columnsValues The filter columns and values
     * @param criteria Pagination criteria
     * @param filterByStore If true, automatically adds store filter for non-superAdmin users
     */
    public static String selectCritQueryBuilderWithoutSort(String entityName, Map<String, String> columnsValues, PaginationCriteria criteria, boolean filterByStore) {

        String queryStr = String.format("SELECT en from %s en ", entityName);
        boolean hasWhereClause = false;
        
        // Add store filter for business entities (non-superAdmin users)
        if (filterByStore && !StoreContext.isSuperAdmin()) {
            Integer storeId = StoreContext.getStoreId();
            if (storeId != null) {
                queryStr += " WHERE en.store.id = " + storeId;
                hasWhereClause = true;
            }
        }
        
        if (!columnsValues.isEmpty()) {
            if (!hasWhereClause) {
                queryStr += " WHERE ";
            } else {
                queryStr += " AND ";
            }
            for (Map.Entry<String, String> entry : columnsValues.entrySet()) {
                String value = entry.getValue().toLowerCase();
                if (value.contains("'")) {
                    value = value.replace("'", "''");
                }
                try {
                    if (entry.getKey().equals(DATE)) {
                        queryStr += " en." + entry.getKey() + " = :date AND ";
                    }else if (entry.getKey().equals(START_DATE)) {
                        queryStr += " en." + entry.getKey() + " >= :startDate AND ";
                    } else if (entry.getKey().equals(END_DATE)) {
                        queryStr += " en." + entry.getKey() + " <= :endDate AND ";
                    } else {
                        if (notNumberColumns.contains(entry.getKey())) {
                            throw new NumberFormatException();
                        }
                        Integer.parseInt(value);
                        queryStr += " en." + entry.getKey() + " = " + value + " AND ";
                    }
                } catch (NumberFormatException e) {
                    queryStr += " LOWER(CAST(en." + entry.getKey() + " as string)) LIKE '%" + value + "%' AND ";
                }
            }
            queryStr = CommonUtil.cleanQueryConditions(queryStr);
        }
        return queryStr;
    }

    public static String getSort(PaginationCriteria criteria){
        String orderBy = (Strings.isBlank(criteria.getSortColumn())) ? "id" : criteria.getSortColumn();
        String sortType = (Strings.isBlank(criteria.getSortColumn())) ? " ASC" : " " + criteria.getSort();
        return (" ORDER BY en." + orderBy + sortType);
    }

    public static String selectCritQueryBuilder(String entityName, Map<String, String> columnsValues, PaginationCriteria criteria) {
        return selectCritQueryBuilder(entityName, columnsValues, criteria, true);
    }
    
    public static String selectCritQueryBuilder(String entityName, Map<String, String> columnsValues, PaginationCriteria criteria, boolean filterByStore) {
        String queryStr = selectCritQueryBuilderWithoutSort(entityName, columnsValues, criteria, filterByStore);
        queryStr += getSort(criteria);
        return queryStr;
    }

    public static <T, S> GlobalPayload<T> globalPayloadBuilder(List<S> entityResultList, IMapper<T, S> mapper) {
        GlobalPayload<T> globalPayload = new GlobalPayload();

        List<S> safeEntities = Objects.nonNull(entityResultList) ? entityResultList : Collections.emptyList();
        int totalNumberOfElements = safeEntities.size();
        List<T> result = Arrays.asList();

        if (totalNumberOfElements > 0) {
            result = (List<T>) mapper.entityListToPayload(safeEntities, false);
        }

        globalPayload.setElements(result);
        globalPayload.setTotalNumberOfElements(totalNumberOfElements);
        return globalPayload;
    }

    public static <T, S> GlobalPayload<T> globalPayloadBuilder(PaginationCriteria criteria, Pageable paging,
                                                              List<S> entityResultList, IMapper<T, S> mapper,
                                                              long totalNumberOfElements) {
        GlobalPayload<T> globalPayload = new GlobalPayload();

        int computedTotalElements = (int) totalNumberOfElements;
        List<T> result = Arrays.asList();
        if (computedTotalElements > 0 && Objects.nonNull(entityResultList) && !entityResultList.isEmpty()) {
            result = (List<T>) mapper.entityListToPayload(entityResultList, false);
        }

        globalPayload.setElements(result);
        globalPayload.setTotalNumberOfElements(computedTotalElements);
        globalPayload.setTotalNumberOfPages(CommonUtil.calculateNumberOfPages(computedTotalElements, criteria.getSize()));
        return globalPayload;
    }

    public static <T, S> GlobalPayload<T> globalPayloadBuilder(PaginationCriteria criteria, Pageable paging,
                                                              List<S> entityResultList, IMapper<T, S> mapper) {
        long total = Objects.nonNull(entityResultList) ? entityResultList.size() : 0;
        return globalPayloadBuilder(criteria, paging, entityResultList, mapper, total);
    }

    public static void applyPagination(Query query, Pageable paging) {
        if (Objects.isNull(query) || Objects.isNull(paging)) {
            return;
        }
        query.setFirstResult((int) paging.getOffset());
        query.setMaxResults(paging.getPageSize());
    }

    public static String countCritQueryBuilder(String entityName, Map<String, String> columnsValues, PaginationCriteria criteria) {
        return countCritQueryBuilder(entityName, columnsValues, criteria, true);
    }
    
    public static String countCritQueryBuilder(String entityName, Map<String, String> columnsValues, PaginationCriteria criteria, boolean filterByStore) {
        String queryWithoutSort = selectCritQueryBuilderWithoutSort(entityName, columnsValues, criteria, filterByStore);
        return queryWithoutSort.replaceFirst("SELECT\\s+en", "SELECT COUNT(en)");
    }

    public static String appendConditions(String baseQuery, List<String> additionalConditions) {
        if (Objects.isNull(baseQuery)) {
            return null;
        }

        if (Objects.isNull(additionalConditions) || additionalConditions.isEmpty()) {
            return baseQuery;
        }

        String trimmedQuery = baseQuery.trim();
        boolean hasWhere = trimmedQuery.toUpperCase().contains(" WHERE ");

        StringBuilder builder = new StringBuilder(trimmedQuery);
        if (!hasWhere) {
            builder.append(" WHERE ");
        } else {
            builder.append(" AND ");
        }
        builder.append(String.join(" AND ", additionalConditions));
        return builder.toString();
    }

    public static String toCountQuery(String query) {
        if (Objects.isNull(query)) {
            return null;
        }
        return query.replaceFirst("SELECT\\s+en", "SELECT COUNT(en)");
    }

    public static <T, S> GlobalPayload<T> fetchPage(EntityManager entityManager,
                                                   String entityName,
                                                   PaginationCriteria criteria,
                                                   Map<String, String> columnsValues,
                                                   IMapper<T, S> mapper) {
        return fetchPage(entityManager, entityName, criteria, columnsValues, mapper, null, true);
    }

    public static <T, S> GlobalPayload<T> fetchPage(EntityManager entityManager,
                                                   String entityName,
                                                   PaginationCriteria criteria,
                                                   Map<String, String> columnsValues,
                                                   IMapper<T, S> mapper,
                                                   java.util.function.Consumer<Query> parameterBinder) {
        return fetchPage(entityManager, entityName, criteria, columnsValues, mapper, parameterBinder, true);
    }
    
    public static <T, S> GlobalPayload<T> fetchPage(EntityManager entityManager,
                                                   String entityName,
                                                   PaginationCriteria criteria,
                                                   Map<String, String> columnsValues,
                                                   IMapper<T, S> mapper,
                                                   java.util.function.Consumer<Query> parameterBinder,
                                                   boolean filterByStore) {
        Pageable paging = pageableBuilder(criteria);

        String queryStr = selectCritQueryBuilder(entityName, columnsValues, criteria, filterByStore);
        Query query = entityManager.createQuery(queryStr);
        String countQueryStr = countCritQueryBuilder(entityName, columnsValues, criteria, filterByStore);
        Query countQuery = entityManager.createQuery(countQueryStr);

        if (Objects.nonNull(parameterBinder)) {
            parameterBinder.accept(query);
            parameterBinder.accept(countQuery);
        }

        applyPagination(query, paging);
        List<S> entityResultList = query.getResultList();
        long total = ((Number) countQuery.getSingleResult()).longValue();

        return globalPayloadBuilder(criteria, paging, entityResultList, mapper, total);
    }

    public static <T, S> GlobalPayload<T> fetchPage(EntityManager entityManager,
                                                   String dataQueryStr,
                                                   String countQueryStr,
                                                   PaginationCriteria criteria,
                                                   IMapper<T, S> mapper,
                                                   java.util.function.Consumer<Query> parameterBinder) {
        Pageable paging = pageableBuilder(criteria);

        Query dataQuery = entityManager.createQuery(dataQueryStr);
        Query countQuery = entityManager.createQuery(countQueryStr);

        if (Objects.nonNull(parameterBinder)) {
            parameterBinder.accept(dataQuery);
            parameterBinder.accept(countQuery);
        }

        applyPagination(dataQuery, paging);
        List<S> entityResultList = dataQuery.getResultList();
        long total = ((Number) countQuery.getSingleResult()).longValue();

        return globalPayloadBuilder(criteria, paging, entityResultList, mapper, total);
    }

    public static Pageable pageableBuilder(PaginationCriteria criteria) {
        Sort sort = Sort.by(Sort.Order.desc("id"));
        String sortCriteria = criteria.getSort();
        String sortColumnCriteria = criteria.getSortColumn();
        if (!sortCriteria.isEmpty()) {
            sort = Sort.by(
                    sortCriteria.equals(CommonConstants.ASC) ? Sort.Order.asc(sortColumnCriteria) : Sort.Order.desc(sortColumnCriteria)
            );
        }
        Pageable paging = PageRequest.of(criteria.getPages(), criteria.getSize(), sort);
        return paging;
    }

    public static String instantToDateTime(Instant instant) {
        if (instant == null) return null;

        LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, ZoneId.of("Africa/Algiers"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_TIME_FORMAT);
        return localDateTime.format(formatter);
    }


    public static String localDateToString(LocalDate date) {
        if (Objects.isNull(date)) {
            return null;
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
        String formattedDate = date.format(formatter);
        return formattedDate;
    }

    public static String generateCode(Integer newCode) {
        if (newCode == null) {
            return null;
        }
        return String.format("%07d", newCode);
    }

    public static String getDateStringDDMMYYYY(){
        LocalDate currentDate = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("ddMMyyyy");
        return currentDate.format(formatter);
    }
    public static double precision4(double value) {
        return Math.floor(value * 10000) / 10000;
    }
}
