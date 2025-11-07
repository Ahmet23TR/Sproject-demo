// Order tipi artık projenin tek doğrusu olarak burada yaşayacak.
export interface Order {
    id: string;
    orderNumber: number;
    createdAt: string;
    notes: string | null;
    initialTotalAmount?: number | null; // Order snapshot total at creation
    finalTotalAmount?: number | null; // Final payable total after delivery adjustments
    initialWholesaleTotalAmount?: number | null;
    finalWholesaleTotalAmount?: number | null;
    initialRetailTotalAmount?: number | null;
    finalRetailTotalAmount?: number | null;
    // Distributor endpoint enriched fields
    totalAmount?: number; // normalized: final for delivered/partially, else initial (AED)
    currency?: string; // e.g., "AED"
    // Overall production status for the entire order
    productionStatus?:
        | "PENDING"
        | "PARTIALLY_COMPLETED"
        | "COMPLETED"
        | "CANCELLED";
    deliveryStatus:
        | "READY_FOR_DELIVERY"
        | "DELIVERED"
        | "FAILED"
        | "CANCELLED"
        | "PENDING"
        | "PARTIALLY_DELIVERED";
    deliveryNotes: string | null;
    user: {
        id: string;
        name: string;
        surname: string;
        companyName: string;
        email: string;
        address: string | null;
    } | null;
    items: OrderItem[]; // OrderItem tipini aşağıda tanımlıyoruz
    attachmentUrl?: string | null;
    deliveredByUserId?: string | null;
    deliveredByUser?: { name: string; surname: string } | null;
    deliveredAt?: string | null;
}

export interface OrderItem {
    id: string;
    quantity: number;
    retailUnitPrice?: number;
    retailTotalPrice?: number;
    finalRetailUnitPrice?: number;
    finalRetailTotalPrice?: number;
    initialRetailUnitPrice?: number;
    initialRetailTotalPrice?: number;
    wholesaleUnitPrice?: number;
    wholesaleTotalPrice?: number;
    unitPrice?: number; // Backend'den gelen birim fiyat (multiplier dahil)
    totalPrice?: number; // Backend'den gelen toplam fiyat (quantity × unitPrice)
    multiplier?: number; // Backend'den gelen çarpan değeri (debug için)
    productionStatus:
        | "PENDING"
        | "PARTIALLY_COMPLETED"
        | "COMPLETED"
        | "CANCELLED";
    producedQuantity?: number; // Kısmi üretim için üretilen adet
    productionNotes: string | null;
    product: {
        id: string;
        name: string;
        unit: string;
        productGroup: ProductGroup;
    } | null;
    selectedOptions: {
        optionItem: {
            id: string;
            name: string;
            price?: string; // Eski alan (geriye uyumluluk)
            multiplier?: string; // Yeni multiplier alanı
        };
    }[];
    processedByUserId?: string | null;
    processedByUser?: { name: string; surname: string } | null;
    processedAt?: string | null;
    // Driver teslimat alanları
    deliveredQuantity?: number; // Teslim edilen adet
    deliveryStatus?: "READY_FOR_DELIVERY" | "PARTIAL" | "DELIVERED" | "FAILED";
    deliveryNotes?: string | null; // Teslimat notları
    deliveredByUserId?: string | null;
    deliveredByUser?: { name: string; surname: string } | null;
    deliveredAt?: string | null;
}

// Product Group enum for chef specialization
export type ProductGroup = "SWEETS" | "BAKERY";

export interface User {
    id: string;
    email: string;
    name: string;
    surname: string;
    role: "ADMIN" | "CLIENT" | "CHEF" | "DRIVER" | "DISTRIBUTOR";
    isActive: boolean;
    companyName: string;
    address: string | null;
    phone?: string | null;
    // Link client to distributor for retail price scoping
    assignedDistributorId?: string | null;
    createdAt?: string;
    orderCount?: number;
    totalOrderAmount?: number;
    // Price list assignment for personalized pricing
    priceListId?: string | null;
    // Chef product group specialization
    productGroup?: ProductGroup;
}

// Detailed client view for distributor/admin read-only endpoint
export interface DistributorClientDetail {
    id: string;
    email: string;
    name: string;
    surname: string;
    phone?: string | null;
    role: "CLIENT";
    isActive: boolean;
    companyName: string;
    address: string | null;
    productGroup?: ProductGroup;
    priceListId?: string | null;
    createdAt?: string;
    // Relations
    priceList?: {
        id: string;
        name: string;
        type?: "WHOLESALE" | "RETAIL";
        distributorId?: string | null;
    } | null;
    assignedDistributor?: {
        id: string;
        name: string;
        surname: string;
        email: string;
    } | null;
    // Stats
    orderCount?: number;
    totalOrderAmount?: number; // only DELIVERED and PARTIALLY_DELIVERED
}

export interface CustomerSummary {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
}

export interface UpdateProfilePayload {
    name?: string;
    surname?: string;
    email?: string;
    companyName?: string;
    address?: string | null;
    phone?: string | null;
    priceListId?: string | null;
}

// Sayfalama bilgisi için tip tanımı
export interface PaginationInfo {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// API'den dönen sayfalanmış veri için generic tip
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

// Dashboard stats endpoint response type
export interface DashboardStats {
    totalOrderCount?: number;
    totalCustomerCount?: number;
    todaysOrderCount?: number;
    todaysCustomerCount?: number;
    todaysTotalRevenue?: number; // Günlük toplam gelir
    quantitySummary: Array<{
        productGroup: "SWEETS" | "BAKERY";
        unit: "PIECE" | "KG" | "TRAY";
        total: number;
    }>;
    productionList?: Array<{ name: string; totalQuantity: number }>;
}

// Ürün fiyatlandırma sistemi için katalog tipleri
export type OptionItem = {
    id: string;
    name: string;
    priceAdjustment?: number;
    price?: number;
    multiplier?: number;
    weightInGrams?: number;
    unit?: string;
};

export type OptionGroup = {
    id: string;
    name: string;
    isRequired: boolean;
    allowMultiple?: boolean;
    items: OptionItem[];
};

export type Product = {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    isActive?: boolean;
    basePrice: number;
    unit?: "PIECE" | "KG" | "TRAY";
    productGroup?: "SWEETS" | "BAKERY";
    categoryId?: string | null;
    category?: { id: string; name: string } | null;
    optionGroups?: OptionGroup[];
};

export type Category = {
    categoryName: string;
    products: Product[];
};

export type Catalog = Category[];

// Pricing engine admin types
export interface PriceListSummary {
    id: string;
    name: string;
    isDefault: boolean;
    type?: "WHOLESALE" | "RETAIL";
    distributorId?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface PriceListOptionItemContext {
    id: string;
    name: string;
    defaultPrice?: number | null;
    optionGroup?: {
        id: string;
        name?: string;
        product?: {
            id: string;
            name: string;
        };
    };
}

export interface PriceListItem {
    id: string;
    price?: number | null;
    multiplier?: number | null;
    optionItemId: string;
    priceListId: string;
    optionItem?: PriceListOptionItemContext;
}

export interface PriceListDetail extends PriceListSummary {
    prices: PriceListItem[];
}

// --- Orders (Dual Pricing) ---
export interface OrderItemDualPricing {
    id?: string;
    product?: {
        id?: string;
        name?: string;
        unit?: string;
    };
    quantity?: number;
    deliveredQuantity?: number | null;
    producedQuantity?: number | null;
    // New dual pricing snapshot fields
    wholesaleUnitPrice?: number;
    wholesaleTotalPrice?: number;
    retailUnitPrice?: number;
    retailTotalPrice?: number;
    // Deprecated fields for backward-compat display (to be removed)
    unitPrice?: number;
    totalPrice?: number;
    // Selected options snapshot (for display)
    selectedOptions?: Array<{ optionItem: { id?: string; name: string } }>;
}

export interface OrderDualPricing {
    id: string;
    createdAt?: string;
    // Order-level totals
    initialWholesaleTotalAmount?: number;
    finalWholesaleTotalAmount?: number;
    initialRetailTotalAmount?: number;
    finalRetailTotalAmount?: number;
    // Links
    wholesalePriceListId?: string | null;
    retailPriceListId?: string | null;
    distributorId?: string | null;
    // Items
    items: OrderItemDualPricing[];
}

// --- Admin Analytics ---
export interface AdminAnalyticsDashboardResponse {
    kpis: {
        todaysOrderCount: number;
        todaysTotalRevenue: number;
        todaysCustomerCount: number;
        customerGrowthPercentage?: string; // Backend'den gelen dinamik değer (örn: "+15.80%")
    };
    charts: {
        last7DaysRevenue: Array<{ date: string; revenue: number }>;
        last7DaysCustomerCount?: Array<{ date: string; customerCount: number }>; // 7 günlük müşteri sayısı trendi
        last30DaysRevenue: Array<{ date: string; revenue: number }>;
        last3MonthsRevenue: Array<{ date: string; revenue: number }>;
        productionByGroupToday: Array<{
            group: ProductGroup;
            total: number;
            amount?: number;
        }>;
        revenueByGroupToday?: Array<{ group: ProductGroup; amount: number }>;
        orderStatusDistribution: Record<string, number>;
    };
    alerts?: {
        delayedOrMissingCount?: number;
    };
}

export interface AdminAnalyticsOrdersQuery {
    page?: number;
    limit?: number;
    startDate?: string; // ISO
    endDate?: string; // ISO
    status?: string; // OrderDeliveryStatus
}

export type AdminAnalyticsOrdersItem = Order;

export type AdminAnalyticsOrdersResponse =
    PaginatedResponse<AdminAnalyticsOrdersItem>;

export interface AdminAnalyticsCustomersQuery {
    page?: number;
    limit?: number;
    sortBy?: "totalSpending" | "orderCount";
}

export interface AdminAnalyticsCustomerItem {
    userId: string;
    orderCount: number;
    totalSpending: number;
    totalInitial: number;
    aov: number;
    savingsOrDiscount: number;
    user: { id: string; email: string; name: string; surname: string };
}

export type AdminAnalyticsCustomersResponse =
    PaginatedResponse<AdminAnalyticsCustomerItem>;

export interface AdminAnalyticsProductionQuery {
    startDate?: string;
    endDate?: string;
    productGroup?: ProductGroup;
    categoryId?: string; // Kategori filtresi
}

export interface AdminAnalyticsProductionResponse {
    byGroup: Array<{
        group: ProductGroup;
        ordered: number;
        produced: number;
        cancelled: number;
        totalRevenue: number; // Grup bazında toplam ciro
    }>;
    byProduct: Array<{
        productId: string;
        productName: string;
        group: ProductGroup;
        ordered: number;
        produced: number;
        cancelled: number;
        categoryName: string | null; // Ürün kategorisi
        totalRevenue: number; // Ürün bazında ciro
        unitPrice: number; // Ortalama birim fiyat
    }>;
    // KPI kartları için özet veriler
    kpis: {
        mostPopularProduct: {
            productId: string;
            productName: string;
            orderCount: number;
        } | null;
        highestRevenueProduct: {
            productId: string;
            productName: string;
            totalRevenue: number;
        } | null;
        cancellationRate: number; // 0-100 arası yüzde
        topSellingProducts: Array<{
            productId: string;
            productName: string;
            orderCount: number;
        }>; // İlk 10 ürün
    };
    fromCache?: boolean; // Yanıt cache'den mi geldi?
    isEmpty?: boolean; // Verisizlik durumu
}

export interface AnalyticsCacheStats {
    hitRate?: number;
    entries?: number;
    ttlSeconds?: number;
    lastClearedAt?: string;
    lastUpdatedAt?: string;
    [key: string]: unknown;
}

export interface AnalyticsTestDataResponse {
    createdCount?: number;
    message?: string;
    [key: string]: unknown;
}

export interface AdminAnalyticsFinancialsQuery {
    timeframe: "daily" | "weekly" | "monthly";
    startDate?: string;
    endDate?: string;
}

export interface AdminAnalyticsFinancialsResponse {
    totals: {
        initialTotalAmount: number;
        finalTotalAmount: number;
        delta: number;
    };
    trend: Array<{
        period: string;
        initialTotalAmount: number;
        finalTotalAmount: number;
        delta: number;
    }>;
}

// Yeni API response yapısı için enhanced types
export interface FinancialsSummary {
    totalInitialAmount: number;
    totalFinalAmount: number;
    totalDelta: number;
    orderCount: number;
    averageOrderValue: number;
    failedOrCancelledRate: number;
}

export interface FinancialsTimeSeries {
    date: string;
    initialAmount: number;
    finalAmount: number;
    delta: number;
}

export interface FinancialsTopLossContributor {
    orderId: string;
    orderNumber: string;
    customerName: string;
    initialAmount: number;
    finalAmount: number;
    lossAmount: number;
    status: "FAILED" | "CANCELLED" | "PARTIALLY_DELIVERED" | "DELIVERED";
}

export interface EnhancedFinancialsData {
    summary: FinancialsSummary;
    timeSeries: FinancialsTimeSeries[];
    topLossContributors: FinancialsTopLossContributor[];
}

// Admin sipariş iptal işlemi için type'lar
export interface CancelOrderPayload {
    notes: string; // Minimum 5 karakter, zorunlu
}

export interface CancelOrderResponse {
    success: boolean;
    message: string;
    order?: Order;
}

// Enhanced Customer Analytics Types
export interface CustomerKPIMetrics {
    totalActiveCustomers: number; // Bu dönemde sipariş veren toplam müşteri
    newCustomers: number; // İlk siparişini veren yeni müşteriler
    averageOrderValue: number; // Ortalama sipariş tutarı (₺)
    orderFrequency: number; // Müşteri başına ortalama sipariş sayısı
    periodInfo: {
        totalOrders: number; // Toplam sipariş sayısı
        totalRevenue: number; // Toplam gelir (₺)
    };
}

export interface CustomerKPIResponse {
    success: boolean;
    message: string;
    data: CustomerKPIMetrics;
}

export interface TopCustomerData {
    userId: string;
    customerName: string;
    companyName: string;
    email: string;
    totalSpending: number; // Toplam harcama (₺)
    orderCount: number; // Sipariş sayısı
    averageOrderValue: number; // AOV (₺)
    priceListName: string; // Fiyat listesi
}

export interface TopCustomersResponse {
    success: boolean;
    data: TopCustomerData[];
}

export interface AcquisitionTrendData {
    month: string; // YYYY-MM format
    monthName: string; // Görüntüleme için
    newCustomers: number; // O aydaki yeni müşteri sayısı
}

export interface AcquisitionTrendResponse {
    success: boolean;
    data: AcquisitionTrendData[];
}

export interface EnhancedCustomerData {
    userId: string;
    customerName: string;
    email: string;
    phone?: string;
    companyName: string;
    orderCount: number;
    totalSpending: number;
    averageOrderValue: number;
    firstOrderDate: string;
    lastOrderDate: string;
    customerSince: number; // Gün olarak müşteri yaşı
    priceListName?: string;
    savingsAmount?: number; // Tasarruf miktarı
}

export interface EnhancedCustomersResponse {
    success: boolean;
    data: {
        data: EnhancedCustomerData[];
        pagination: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            pageSize: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
    };
}

export interface AtRiskCustomerData {
    userId: string;
    customerName: string;
    email: string;
    lastOrderDate: string;
    daysSinceLastOrder: number; // Gün cinsinden
    totalOrders: number; // Toplam sipariş geçmişi
    totalSpending: number; // Toplam harcama geçmişi
    riskLevel: "LOW" | "MEDIUM" | "HIGH"; // Risk seviyesi
}

export interface AtRiskCustomersResponse {
    success: boolean;
    data: AtRiskCustomerData[];
}

// Query params for enhanced customer analytics
export interface CustomerKPIQuery {
    startDate?: string;
    endDate?: string;
}

export interface TopCustomersQuery {
    limit?: number;
}

export interface AcquisitionTrendQuery {
    months?: number;
}

export interface EnhancedCustomersQuery {
    page?: number;
    limit?: number;
    sortBy?:
        | "totalSpending"
        | "orderCount"
        | "averageOrderValue"
        | "firstOrderDate"
        | "lastOrderDate";
    sortOrder?: "asc" | "desc";
    search?: string;
}

export interface AtRiskCustomersQuery {
    daysThreshold?: number;
    limit?: number;
}

// --- Distributor Types ---
export interface DistributorDailySummary {
    totalClients: number;
    totalOrders: number;
    grandTotalRevenue: number;
}

export interface DistributorClientSummary {
    clientId: string;
    clientName: string;
    clientAddress: string;
    clientPhoneNumber: string;
    numberOfOrders: number;
    clientDailyTotal: number;
}

export interface DistributorDailyClientSummaryResponse {
    date: string;
    dailySummary: DistributorDailySummary;
    clientSummaries: DistributorClientSummary[];
}

// --- Distributor Product Summary Types ---
export interface DistributorOptionItem {
    optionItemId: string;
    optionItemName: string;
    defaultPrice?: number;
    multiplier?: number;
}

export interface DistributorOptionGroup {
    optionGroupId: string;
    optionGroupName: string;
    isRequired: boolean;
    allowMultiple: boolean;
    selectedItems: DistributorOptionItem[];
}

export interface DistributorProductSummaryItem {
    productId: string;
    productName: string;
    productUnit: string;
    optionGroups: DistributorOptionGroup[];
    totalQuantity: number;
    unitPrice?: number;
    totalAmount: number;
}

export interface DistributorDailyProductSummary {
    totalProducts: number;
    totalQuantity: number;
    totalItems: number;
    grandTotalAmount: number;
}

export interface DistributorDailyProductSummaryResponse {
    date: string;
    dailySummary: DistributorDailyProductSummary;
    productSummaries: DistributorProductSummaryItem[];
}

// --- Distributor Orders Types ---
export interface DistributorDailyOrdersResponse {
    date: string;
    orders: Order[];
    summary: {
        totalOrders: number;
        totalAmount: number;
    };
}
