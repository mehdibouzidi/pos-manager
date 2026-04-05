package com.mystore.manager.api.business.payload;

import java.math.BigDecimal;
import java.util.List;

public class DashboardPayload {

    private Long totalSalesCount;
    private Double totalSalesQuantity;
    private BigDecimal totalSalesRevenue;
    private BigDecimal totalEntryValue;
    private BigDecimal totalLossValue;
    private BigDecimal netBenefit;
    private List<ProductSalesStats> productStats;
    private List<SalesHistoryPoint> salesHistory;

    public Long getTotalSalesCount() { return totalSalesCount; }
    public void setTotalSalesCount(Long totalSalesCount) { this.totalSalesCount = totalSalesCount; }

    public Double getTotalSalesQuantity() { return totalSalesQuantity; }
    public void setTotalSalesQuantity(Double totalSalesQuantity) { this.totalSalesQuantity = totalSalesQuantity; }

    public BigDecimal getTotalSalesRevenue() { return totalSalesRevenue; }
    public void setTotalSalesRevenue(BigDecimal totalSalesRevenue) { this.totalSalesRevenue = totalSalesRevenue; }

    public BigDecimal getTotalEntryValue() { return totalEntryValue; }
    public void setTotalEntryValue(BigDecimal totalEntryValue) { this.totalEntryValue = totalEntryValue; }

    public BigDecimal getTotalLossValue() { return totalLossValue; }
    public void setTotalLossValue(BigDecimal totalLossValue) { this.totalLossValue = totalLossValue; }

    public BigDecimal getNetBenefit() { return netBenefit; }
    public void setNetBenefit(BigDecimal netBenefit) { this.netBenefit = netBenefit; }

    public List<ProductSalesStats> getProductStats() { return productStats; }
    public void setProductStats(List<ProductSalesStats> productStats) { this.productStats = productStats; }

    public List<SalesHistoryPoint> getSalesHistory() { return salesHistory; }
    public void setSalesHistory(List<SalesHistoryPoint> salesHistory) { this.salesHistory = salesHistory; }

    public static class ProductSalesStats {
        private Integer productId;
        private String productCode;
        private String productName;
        private BigDecimal retailPrice;
        private Long salesCount;
        private Double salesQuantity;
        private BigDecimal salesRevenue;
        private Double entryQuantity;
        private BigDecimal entryValue;
        private BigDecimal avgCostPrice;
        private BigDecimal margin;

        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }

        public String getProductCode() { return productCode; }
        public void setProductCode(String productCode) { this.productCode = productCode; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public BigDecimal getRetailPrice() { return retailPrice; }
        public void setRetailPrice(BigDecimal retailPrice) { this.retailPrice = retailPrice; }

        public Long getSalesCount() { return salesCount; }
        public void setSalesCount(Long salesCount) { this.salesCount = salesCount; }

        public Double getSalesQuantity() { return salesQuantity; }
        public void setSalesQuantity(Double salesQuantity) { this.salesQuantity = salesQuantity; }

        public BigDecimal getSalesRevenue() { return salesRevenue; }
        public void setSalesRevenue(BigDecimal salesRevenue) { this.salesRevenue = salesRevenue; }

        public Double getEntryQuantity() { return entryQuantity; }
        public void setEntryQuantity(Double entryQuantity) { this.entryQuantity = entryQuantity; }

        public BigDecimal getEntryValue() { return entryValue; }
        public void setEntryValue(BigDecimal entryValue) { this.entryValue = entryValue; }

        public BigDecimal getAvgCostPrice() { return avgCostPrice; }
        public void setAvgCostPrice(BigDecimal avgCostPrice) { this.avgCostPrice = avgCostPrice; }

        public BigDecimal getMargin() { return margin; }
        public void setMargin(BigDecimal margin) { this.margin = margin; }
    }

    public static class SalesHistoryPoint {
        private String period;
        private Long salesCount;
        private BigDecimal salesRevenue;

        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }

        public Long getSalesCount() { return salesCount; }
        public void setSalesCount(Long salesCount) { this.salesCount = salesCount; }

        public BigDecimal getSalesRevenue() { return salesRevenue; }
        public void setSalesRevenue(BigDecimal salesRevenue) { this.salesRevenue = salesRevenue; }
    }
}
