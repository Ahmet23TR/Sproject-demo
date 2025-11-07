import type { AxiosRequestConfig } from "axios";
import type {
    AcquisitionTrendData,
    AdminAnalyticsDashboardResponse,
    AdminAnalyticsProductionResponse,
    CustomerKPIMetrics,
    CustomerSummary,
    DistributorClientDetail,
    DistributorDailyClientSummaryResponse,
    DistributorDailyOrdersResponse,
    DistributorDailyProductSummaryResponse,
    EnhancedCustomerData,
    EnhancedFinancialsData,
    Order,
    PriceListDetail,
    PriceListSummary,
    Product,
    ProductPayload,
    ProductionItem,
    TopCustomerData,
    User,
} from "@/types/data";
import { createDemoState, createOrder } from "./data";
import type { DemoState, DemoUser, DemoCartItemPayload } from "./types";
import { createMockToken, decodeMockToken } from "./token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const normalizePath = (path: string) => {
    if (!path) return "/";
    const withoutBase = path.replace(/^https?:\/\/[^/]+/, "");
    return withoutBase.replace(/^\/api/, "") || "/";
};

const paginate = <T>(
    data: T[],
    page: number = 1,
    limit: number = 10
) => {
    const start = (page - 1) * limit;
    const paged = data.slice(start, start + limit);
    return {
        data: paged,
        pagination: {
            totalItems: data.length,
            totalPages: Math.max(1, Math.ceil(data.length / limit)),
            currentPage: page,
            pageSize: limit,
            hasNext: start + limit < data.length,
            hasPrevious: start > 0,
        },
    };
};

const toDateKey = (iso: string) => iso.split("T")[0];

const getIsoWeekLabel = (date: Date) => {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

class MockServer {
    private state: DemoState = createDemoState();

    private parseUrl(
        rawUrl: string,
        params?: AxiosRequestConfig["params"]
    ): { path: string; query: URLSearchParams } {
        const base =
            rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
                ? rawUrl
                : `https://mock.local${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
        const url = new URL(base);
        const query = new URLSearchParams(url.search);
        if (params) {
            if (params instanceof URLSearchParams) {
                params.forEach((value, key) => query.append(key, value));
            } else if (Array.isArray(params)) {
                params.forEach(([key, value]) =>
                    query.append(String(key), String(value))
                );
            } else if (typeof params === "object") {
                Object.entries(params).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach((entry) =>
                            query.append(key, String(entry))
                        );
                    } else if (value !== undefined && value !== null) {
                        query.append(key, String(value));
                    }
                });
            } else if (typeof params === "string") {
                new URLSearchParams(params).forEach((value, key) =>
                    query.append(key, value)
                );
            }
        }
        return { path: normalizePath(url.pathname), query };
    }

    private getUserFromConfig(
        config?: AxiosRequestConfig
    ): DemoUser | null {
        const headerValue =
            config?.headers &&
            (config.headers["Authorization"] ||
                config.headers["authorization"]);
        if (typeof headerValue !== "string") {
            return null;
        }
        const token = headerValue.replace(/^Bearer\s+/i, "").trim();
        const payload = decodeMockToken(token);
        if (!payload?.id) return null;
        return (
            this.state.users.find((user) => user.id === payload.id) ?? null
        );
    }

    private ensureAuth(
        config: AxiosRequestConfig | undefined,
        roles?: User["role"][]
    ): DemoUser {
        const user = this.getUserFromConfig(config);
        if (!user) {
            throw new Error("Authentication required");
        }
        if (roles && !roles.includes(user.role)) {
            throw new Error("You are not allowed to perform this action");
        }
        return user;
    }

    private findUserByIdentifier(identifier: string): DemoUser | undefined {
        const normalized = identifier.toLowerCase();
        return this.state.users.find(
            (user) =>
                user.email.toLowerCase() === normalized ||
                user.phone?.replace(/\D/g, "") === normalized.replace(/\D/g, "")
        );
    }

    private toPublicUser(user: DemoUser): User {
        const { password: _unusedPassword, ...publicUser } = user;
        void _unusedPassword;
        return publicUser;
    }

    private handleLogin(data: unknown) {
        const payload = data as { identifier?: string; password?: string };
        if (!payload?.identifier || !payload?.password) {
            throw new Error("Identifier and password are required");
        }
        const user = this.findUserByIdentifier(payload.identifier);
        if (!user || user.password !== payload.password) {
            throw new Error("Invalid email/phone or password");
        }
        if (!user.isActive) {
            throw new Error(
                "Your account is not yet approved by the administrator."
            );
        }
        return {
            token: createMockToken(user),
            user: this.toPublicUser(user),
        };
    }

    private listUsers(query: URLSearchParams) {
        const role = query.get("role") as User["role"] | null;
        const page = Number(query.get("page") || "1");
        const limit = Number(query.get("limit") || "10");
        const filtered = role
            ? this.state.users.filter((user) => user.role === role)
            : this.state.users;
        const response = paginate(filtered, page, limit);
        return {
            data: response.data.map((user) => this.toPublicUser(user)),
            pagination: response.pagination,
        };
    }

    private getCustomerSummary(): CustomerSummary {
        const clients = this.state.users.filter((user) => user.role === "CLIENT");
        return {
            totalCustomers: clients.length,
            activeCustomers: clients.filter((c) => c.isActive).length,
            inactiveCustomers: clients.filter((c) => !c.isActive).length,
        };
    }

    private getClientsForDistributor(user: DemoUser): DemoUser[] {
        if (user.role === "ADMIN") {
            return this.state.users.filter((candidate) => candidate.role === "CLIENT");
        }
        if (user.role === "DISTRIBUTOR") {
            return this.state.users.filter(
                (candidate) =>
                    candidate.role === "CLIENT" &&
                    candidate.assignedDistributorId === user.id
            );
        }
        return [];
    }

    private canAccessClient(user: DemoUser, client: DemoUser): boolean {
        if (user.role === "ADMIN") return true;
        if (user.role === "DISTRIBUTOR") {
            return client.assignedDistributorId === user.id;
        }
        return false;
    }

    private buildDistributorClientDetail(client: DemoUser): DistributorClientDetail {
        const priceList = client.priceListId
            ? this.state.priceLists.find((pl) => pl.id === client.priceListId) ?? null
            : null;
        const assignedDistributor =
            client.assignedDistributorId &&
            this.state.users.find((user) => user.id === client.assignedDistributorId);

        const clientOrders = this.state.orders.filter(
            (order) => order.user?.id === client.id
        );
        const deliveredStatuses = new Set<Order["deliveryStatus"]>([
            "DELIVERED",
            "PARTIALLY_DELIVERED",
        ]);
        const totalOrderAmount = clientOrders.reduce((sum, order) => {
            if (!deliveredStatuses.has(order.deliveryStatus)) {
                return sum;
            }
            const value =
                order.finalTotalAmount ??
                order.finalRetailTotalAmount ??
                order.initialTotalAmount ??
                order.initialRetailTotalAmount ??
                0;
            return sum + (value || 0);
        }, 0);

        return {
            id: client.id,
            email: client.email,
            name: client.name,
            surname: client.surname,
            phone: client.phone ?? null,
            role: "CLIENT",
            isActive: client.isActive,
            companyName: client.companyName,
            address: client.address ?? null,
            productGroup: client.productGroup,
            priceListId: client.priceListId ?? null,
            createdAt: client.createdAt,
            priceList: priceList
                ? {
                      id: priceList.id,
                      name: priceList.name,
                      type: priceList.type,
                      distributorId: priceList.distributorId,
                  }
                : null,
            assignedDistributor: assignedDistributor
                ? {
                      id: assignedDistributor.id,
                      name: assignedDistributor.name,
                      surname: assignedDistributor.surname,
                      email: assignedDistributor.email,
                  }
                : null,
            orderCount: clientOrders.length,
            totalOrderAmount: Number(totalOrderAmount.toFixed(2)),
        };
    }

    private getProductionList(dateKey: string): ProductionItem[] {
        const production: ProductionItem[] = [];
        this.state.orders
            .filter((order) => toDateKey(order.createdAt) === dateKey)
            .forEach((order) => {
                order.items.forEach((item) => {
                    if (!item.product) return;
                    if (item.productionStatus === "CANCELLED") return;
                    const produced =
                        item.producedQuantity ??
                        (item.productionStatus === "COMPLETED"
                            ? item.quantity
                            : 0);
                    const remaining = Math.max(0, item.quantity - produced);
                    if (remaining <= 0) return;
                    production.push({
                        productName: item.product.name,
                        variantName:
                            item.selectedOptions?.map(
                                (opt) => opt.optionItem.name
                            )[0] ?? "Standard",
                        total: remaining,
                        unit: (item.product.unit ||
                            "PIECE") as ProductionItem["unit"],
                        productGroup: item.product.productGroup,
                    });
                });
            });
        return production;
    }

    private getAdminDashboard(): AdminAnalyticsDashboardResponse {
        const todayKey = toDateKey(new Date().toISOString());
        const todaysOrders = this.state.orders.filter(
            (order) => toDateKey(order.createdAt) === todayKey
        );
        const todaysRevenue = todaysOrders.reduce(
            (sum, order) => sum + (order.finalTotalAmount || 0),
            0
        );
        const chartSeries = (days: number) => {
            return Array.from({ length: days }).map((_, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (days - 1 - index));
                const revenue = this.state.orders
                    .filter(
                        (order) => toDateKey(order.createdAt) === toDateKey(date.toISOString())
                    )
                    .reduce(
                        (sum, order) => sum + (order.finalTotalAmount || 0),
                        0
                    );
                return { date: toDateKey(date.toISOString()), revenue };
            });
        };
        const productGroupBreakdown = ["SWEETS", "BAKERY"].map((group) => {
            const amount = this.state.orders
                .flatMap((order) => order.items)
                .filter((item) => item.product?.productGroup === group)
                .reduce((sum, item) => sum + (item.retailTotalPrice || 0), 0);
            return { group, amount };
        });
        return {
            kpis: {
                todaysOrderCount: todaysOrders.length,
                todaysTotalRevenue: Number(todaysRevenue.toFixed(2)),
                todaysCustomerCount: todaysOrders
                    .map((order) => order.user?.id)
                    .filter((value, idx, arr) => value && arr.indexOf(value) === idx)
                    .length,
                customerGrowthPercentage: "+4.8%",
            },
            charts: {
                last7DaysRevenue: chartSeries(7),
                last30DaysRevenue: chartSeries(30),
                last3MonthsRevenue: chartSeries(90),
                productionByGroupToday: ["SWEETS", "BAKERY"].map((group) => ({
                    group,
                    total: this.getProductionList(todayKey)
                        .filter((item) => item.productGroup === group)
                        .reduce((sum, item) => sum + item.total, 0),
                    amount: productGroupBreakdown.find(
                        (item) => item.group === group
                    )?.amount,
                })),
                revenueByGroupToday: productGroupBreakdown,
                orderStatusDistribution: this.state.orders.reduce(
                    (acc, order) => {
                        acc[order.deliveryStatus] =
                            (acc[order.deliveryStatus] || 0) + 1;
                        return acc;
                    },
                    {} as Record<string, number>
                ),
            },
        };
    }

    private filterOrdersByDateRange(start?: string | null, end?: string | null) {
        const startTime = start ? new Date(start).getTime() : Number.NEGATIVE_INFINITY;
        const endTime = end ? new Date(end).getTime() : Number.POSITIVE_INFINITY;
        return this.state.orders.filter((order) => {
            const created = new Date(order.createdAt).getTime();
            return created >= startTime && created <= endTime;
        });
    }

    private getFinancialsReport(
        query: URLSearchParams
    ): EnhancedFinancialsData {
        const startDate = query.get("startDate");
        const endDate = query.get("endDate");
        const timeframe = query.get("timeframe") || "daily";
        const scopedOrders = this.filterOrdersByDateRange(startDate, endDate);

        const totals = scopedOrders.reduce(
            (acc, order) => {
                const initial = order.initialTotalAmount || 0;
                const final = order.finalTotalAmount || 0;
                acc.initial += initial;
                acc.final += final;
                return acc;
            },
            { initial: 0, final: 0 }
        );

        const deltas = totals.final - totals.initial;
        const orderCount = scopedOrders.length;
        const averageOrderValue =
            orderCount > 0 ? totals.final / orderCount : 0;
        const failedOrCancelled = scopedOrders.filter((order) =>
            ["FAILED", "CANCELLED"].includes(order.deliveryStatus)
        ).length;

        const summary = {
            totalInitialAmount: Number(totals.initial.toFixed(2)),
            totalFinalAmount: Number(totals.final.toFixed(2)),
            totalDelta: Number(deltas.toFixed(2)),
            orderCount,
            averageOrderValue: Number(averageOrderValue.toFixed(2)),
            failedOrCancelledRate:
                orderCount > 0
                    ? Number(
                          (
                              (failedOrCancelled / orderCount) *
                              100
                          ).toFixed(2)
                      )
                    : 0,
        };

        const timeBuckets: Record<string, { initial: number; final: number }> = {};
        scopedOrders.forEach((order) => {
            const dateObj = new Date(order.createdAt);
            const dateKey =
                timeframe === "monthly"
                    ? order.createdAt.slice(0, 7)
                    : timeframe === "weekly"
                    ? getIsoWeekLabel(dateObj)
                    : toDateKey(order.createdAt);
            if (!timeBuckets[dateKey]) {
                timeBuckets[dateKey] = { initial: 0, final: 0 };
            }
            timeBuckets[dateKey].initial += order.initialTotalAmount || 0;
            timeBuckets[dateKey].final += order.finalTotalAmount || 0;
        });

        const timeSeries = Object.entries(timeBuckets)
            .sort(([a], [b]) => (a > b ? 1 : -1))
            .map(([period, values]) => ({
                date: period,
                initialAmount: Number(values.initial.toFixed(2)),
                finalAmount: Number(values.final.toFixed(2)),
                delta: Number((values.final - values.initial).toFixed(2)),
            }));

        const topLossContributors = scopedOrders
            .filter((order) =>
                ["FAILED", "CANCELLED", "PARTIALLY_DELIVERED"].includes(
                    order.deliveryStatus
                )
            )
            .map((order) => ({
                orderId: order.id,
                orderNumber: String(order.orderNumber),
                customerName:
                    order.user?.companyName ||
                    `${order.user?.name ?? ""} ${order.user?.surname ?? ""}`.trim(),
                initialAmount: order.initialTotalAmount || 0,
                finalAmount: order.finalTotalAmount || 0,
                lossAmount:
                    (order.initialTotalAmount || 0) -
                    (order.finalTotalAmount || 0),
                status: order.deliveryStatus as
                    | "FAILED"
                    | "CANCELLED"
                    | "PARTIALLY_DELIVERED"
                    | "DELIVERED",
            }))
            .sort((a, b) => b.lossAmount - a.lossAmount)
            .slice(0, 5);

        return {
            summary,
            timeSeries,
            topLossContributors,
        };
    }

    private getCustomerKpiMetrics(
        filters: URLSearchParams
    ): CustomerKPIMetrics {
        const startDate = filters.get("startDate");
        const endDate = filters.get("endDate");
        const scopedOrders = this.filterOrdersByDateRange(startDate, endDate);
        const uniqueCustomers = new Set(
            scopedOrders.map((order) => order.user?.id).filter(Boolean) as string[]
        );
        const newCustomers = scopedOrders.filter((order) => {
            if (!order.user?.id) return false;
            const firstOrder = this.state.orders
                .filter((o) => o.user?.id === order.user?.id)
                .sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                )[0];
            return firstOrder?.id === order.id;
        }).length;

        const totalRevenue = scopedOrders.reduce(
            (sum, order) => sum + (order.finalTotalAmount || 0),
            0
        );
        const averageOrderValue =
            scopedOrders.length > 0 ? totalRevenue / scopedOrders.length : 0;
        const orderFrequency =
            uniqueCustomers.size > 0
                ? scopedOrders.length / uniqueCustomers.size
                : 0;

        return {
            totalActiveCustomers: uniqueCustomers.size,
            newCustomers,
            averageOrderValue: Number(averageOrderValue.toFixed(2)),
            orderFrequency: Number(orderFrequency.toFixed(2)),
            periodInfo: {
                totalOrders: scopedOrders.length,
                totalRevenue: Number(totalRevenue.toFixed(2)),
            },
        };
    }

    private getTopCustomersData(limit: number): TopCustomerData[] {
        const map = new Map<
            string,
            { revenue: number; orders: number; name: string; company?: string }
        >();
        this.state.orders.forEach((order) => {
            const customerId = order.user?.id;
            if (!customerId) return;
            if (!map.has(customerId)) {
                map.set(customerId, {
                    revenue: 0,
                    orders: 0,
                    name:
                        order.user?.companyName ||
                        `${order.user?.name ?? ""} ${
                            order.user?.surname ?? ""
                        }`.trim(),
                });
            }
            const current = map.get(customerId)!;
            current.revenue += order.finalTotalAmount || 0;
            current.orders += 1;
        });
        return Array.from(map.entries())
            .map(([userId, stats]) => ({
                userId,
                customerName: stats.name,
                companyName: stats.name,
                email:
                    this.state.users.find((user) => user.id === userId)
                        ?.email ?? "",
                totalSpending: Number(stats.revenue.toFixed(2)),
                orderCount: stats.orders,
                averageOrderValue: Number(
                    (stats.revenue / stats.orders).toFixed(2)
                ),
                priceListName:
                    this.state.priceLists.find(
                        (list) =>
                            list.id ===
                            this.state.users.find(
                                (user) => user.id === userId
                            )?.priceListId
                    )?.name || "Standard Retail",
            }))
            .sort((a, b) => b.totalSpending - a.totalSpending)
            .slice(0, limit);
    }

    private getAcquisitionTrendData(months: number): AcquisitionTrendData[] {
        const trend: AcquisitionTrendData[] = [];
        for (let i = months - 1; i >= 0; i -= 1) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().slice(0, 7);
            const newCustomers = this.state.orders.filter((order) => {
                if (!order.user?.id) return false;
                const firstOrder = this.state.orders
                    .filter((o) => o.user?.id === order.user?.id)
                    .sort(
                        (a, b) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                    )[0];
                return (
                    firstOrder?.id === order.id &&
                    firstOrder.createdAt.slice(0, 7) === monthKey
                );
            }).length;
            trend.push({
                month: monthKey,
                monthName: date.toLocaleString("en-US", {
                    month: "short",
                    year: "numeric",
                }),
                newCustomers,
            });
        }
        return trend;
    }

    private getEnhancedCustomersData(
        query: URLSearchParams
    ): {
        data: EnhancedCustomerData[];
        pagination: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            pageSize: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
    } {
        const page = Number(query.get("page") || "1");
        const limit = Number(query.get("limit") || "25");
        const search = (query.get("search") || "").toLowerCase();
        const clients = this.state.users.filter(
            (user) => user.role === "CLIENT"
        );
        const rows: EnhancedCustomerData[] = clients.map((client) => {
            const clientOrders = this.state.orders.filter(
                (order) => order.user?.id === client.id
            );
            const totalSpending = clientOrders.reduce(
                (sum, order) => sum + (order.finalTotalAmount || 0),
                0
            );
            const orderCount = clientOrders.length;
            const averageOrderValue =
                orderCount > 0 ? totalSpending / orderCount : 0;
            return {
                userId: client.id,
                customerName:
                    client.companyName ||
                    `${client.name} ${client.surname}`.trim(),
                email: client.email,
                phone: client.phone ?? undefined,
                companyName: client.companyName,
                orderCount,
                totalSpending: Number(totalSpending.toFixed(2)),
                averageOrderValue: Number(averageOrderValue.toFixed(2)),
            };
        });
        let filtered = rows;
        if (search) {
            filtered = rows.filter((row) =>
                row.customerName.toLowerCase().includes(search)
            );
        }
        const response = paginate(filtered, page, limit);
        return {
            data: response.data,
            pagination: {
                ...response.pagination,
                hasNext: response.pagination.hasNext,
                hasPrevious: response.pagination.hasPrevious,
            },
        };
    }

    private getProductionAnalytics(): AdminAnalyticsProductionResponse {
        const productGroups = ["SWEETS", "BAKERY"] as const;
        const byGroup = productGroups.map((group) => {
            const items = this.state.orders
                .flatMap((order) => order.items)
                .filter((item) => item.product?.productGroup === group);
            const ordered = items.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
            const produced = items.reduce(
                (sum, item) => sum + (item.producedQuantity ?? item.quantity),
                0
            );
            const cancelled = items.filter(
                (item) => item.productionStatus === "CANCELLED"
            ).length;
            const totalRevenue = items.reduce(
                (sum, item) => sum + (item.retailTotalPrice || 0),
                0
            );
            return {
                group,
                ordered,
                produced,
                cancelled,
                totalRevenue,
            };
        });

        const byProduct = this.state.products.map((product) => {
            const items = this.state.orders
                .flatMap((order) => order.items)
                .filter((item) => item.product?.id === product.id);
            const ordered = items.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
            const produced = items.reduce(
                (sum, item) => sum + (item.producedQuantity ?? item.quantity),
                0
            );
            const cancelled = items.filter(
                (item) => item.productionStatus === "CANCELLED"
            ).length;
            const totalRevenue = items.reduce(
                (sum, item) => sum + (item.retailTotalPrice || 0),
                0
            );
            const unitPrice =
                items.length > 0
                    ? totalRevenue /
                      items.reduce((sum, item) => sum + item.quantity, 0)
                    : product.basePrice;
            return {
                productId: product.id,
                productName: product.name,
                group: product.productGroup,
                ordered,
                produced,
                cancelled,
                categoryName: product.category?.name ?? null,
                totalRevenue,
                unitPrice: Number(unitPrice.toFixed(2)),
            };
        });

        return {
            byGroup,
            byProduct,
            kpis: {
                mostPopularProduct: byProduct
                    .sort((a, b) => b.ordered - a.ordered)
                    .slice(0, 1)
                    .map((item) => ({
                        productId: item.productId,
                        productName: item.productName,
                        orderCount: item.ordered,
                    }))[0] || null,
                highestRevenueProduct: byProduct
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 1)
                    .map((item) => ({
                        productId: item.productId,
                        productName: item.productName,
                        totalRevenue: item.totalRevenue,
                    }))[0] || null,
                cancellationRate: Number(
                    (
                        (byProduct.reduce((sum, item) => sum + item.cancelled, 0) /
                            (byProduct.reduce((sum, item) => sum + item.ordered, 0) ||
                                1)) *
                        100
                    ).toFixed(2)
                ),
                topSellingProducts: byProduct
                    .sort((a, b) => b.ordered - a.ordered)
                    .slice(0, 5)
                    .map((item) => ({
                        productId: item.productId,
                        productName: item.productName,
                        orderCount: item.ordered,
                    })),
            },
        };
    }

    private getDistributorDailyClientSummary(
        date: string
    ): DistributorDailyClientSummaryResponse {
        const summaries = this.state.orders
            .filter((order) => toDateKey(order.createdAt) === date)
            .reduce<
                Record<
                    string,
                    {
                        total: number;
                        count: number;
                        name: string;
                        address: string;
                        phone?: string;
                    }
                >
            >((acc, order) => {
                const id = order.user?.id ?? "unknown";
                if (!acc[id]) {
                    acc[id] = {
                        total: 0,
                        count: 0,
                        name:
                            order.user?.companyName ||
                            `${order.user?.name ?? ""} ${
                                order.user?.surname ?? ""
                            }`.trim(),
                        address: order.user?.address || "Dubai, UAE",
                        phone: order.user?.phone ?? undefined,
                    };
                }
                acc[id].total += order.finalTotalAmount || 0;
                acc[id].count += 1;
                return acc;
            }, {});
        const clientSummaries = Object.entries(summaries).map(
            ([clientId, stats]) => ({
                clientId,
                clientName: stats.name,
                clientAddress: stats.address,
                clientPhoneNumber: stats.phone || "+971500000000",
                numberOfOrders: stats.count,
                clientDailyTotal: Number(stats.total.toFixed(2)),
            })
        );
        return {
            date,
            dailySummary: {
                totalClients: clientSummaries.length,
                totalOrders: clientSummaries.reduce(
                    (sum, entry) => sum + entry.numberOfOrders,
                    0
                ),
                grandTotalRevenue: Number(
                    clientSummaries
                        .reduce((sum, entry) => sum + entry.clientDailyTotal, 0)
                        .toFixed(2)
                ),
            },
            clientSummaries,
        };
    }

    private getDistributorDailyProductSummary(
        date: string
    ): DistributorDailyProductSummaryResponse {
        const products = this.state.orders
            .filter((order) => toDateKey(order.createdAt) === date)
            .flatMap((order) => order.items);
        const map = new Map<
            string,
            {
                product: Product | null;
                quantity: number;
                total: number;
            }
        >();
        products.forEach((item) => {
            if (!item.product) return;
            if (!map.has(item.product.id)) {
                map.set(item.product.id, {
                    product: this.state.products.find(
                        (product) => product.id === item.product?.id
                    ) ?? null,
                    quantity: 0,
                    total: 0,
                });
            }
            const entry = map.get(item.product.id)!;
            entry.quantity += item.quantity;
            entry.total += item.retailTotalPrice || 0;
        });

        const productSummaries = Array.from(map.values()).map((entry) => ({
            productId: entry.product?.id ?? "",
            productName: entry.product?.name ?? "Unknown",
            productUnit: entry.product?.unit ?? "PIECE",
            optionGroups: entry.product?.optionGroups?.map((group) => ({
                optionGroupId: group.id,
                optionGroupName: group.name,
                isRequired: group.isRequired,
                allowMultiple: group.allowMultiple ?? false,
                selectedItems: group.items.map((item) => ({
                    optionItemId: item.id,
                    optionItemName: item.name,
                    defaultPrice:
                        typeof item.priceAdjustment === "number"
                            ? item.priceAdjustment
                            : Number(item.price ?? 0),
                    multiplier:
                        typeof item.multiplier === "string"
                            ? Number(item.multiplier)
                            : item.multiplier,
                })),
            })) ?? [],
            totalQuantity: entry.quantity,
            unitPrice:
                entry.quantity > 0
                    ? Number((entry.total / entry.quantity).toFixed(2))
                    : entry.product?.basePrice,
            totalAmount: Number(entry.total.toFixed(2)),
        }));

        return {
            date,
            dailySummary: {
                totalProducts: productSummaries.length,
                totalQuantity: productSummaries.reduce(
                    (sum, item) => sum + item.totalQuantity,
                    0
                ),
                totalItems: productSummaries.reduce(
                    (sum, item) => sum + item.totalQuantity,
                    0
                ),
                grandTotalAmount: Number(
                    productSummaries
                        .reduce((sum, item) => sum + item.totalAmount, 0)
                        .toFixed(2)
                ),
            },
            productSummaries,
        };
    }

    private getProductStatistics(): ProductStatisticsSnapshot {
        const totalProducts = this.state.products.length;
        const activeProducts = this.state.products.filter(
            (product) => product.isActive
        ).length;
        const inactiveProducts = totalProducts - activeProducts;

        const salesMap = new Map<
            string,
            { quantity: number; revenue: number }
        >();

        this.state.orders.forEach((order) => {
            order.items.forEach((item) => {
                const productId = item.product?.id;
                if (!productId) return;
                if (!salesMap.has(productId)) {
                    salesMap.set(productId, { quantity: 0, revenue: 0 });
                }
                const entry = salesMap.get(productId)!;
                entry.quantity += item.quantity;
                entry.revenue +=
                    item.retailTotalPrice ??
                    item.totalPrice ??
                    (item.unitPrice || 0) * item.quantity;
            });
        });

        const sortedByQuantity = Array.from(salesMap.entries()).sort(
            (a, b) => b[1].quantity - a[1].quantity
        );
        const sortedByRevenue = Array.from(salesMap.entries()).sort(
            (a, b) => b[1].revenue - a[1].revenue
        );

        const topSellingEntry = sortedByQuantity[0];
        const topRevenueEntry = sortedByRevenue[0];

        const topSellingProduct = topSellingEntry
            ? {
                  id: topSellingEntry[0],
                  name:
                      this.state.products.find(
                          (product) => product.id === topSellingEntry[0]
                      )?.name ?? "Unknown Product",
                  salesCount: topSellingEntry[1].quantity,
              }
            : undefined;

        const topSellingProductByRevenue = topRevenueEntry
            ? {
                  id: topRevenueEntry[0],
                  name:
                      this.state.products.find(
                          (product) => product.id === topRevenueEntry[0]
                      )?.name ?? "Unknown Product",
                  totalRevenue: Number(topRevenueEntry[1].revenue.toFixed(2)),
              }
            : undefined;

        return {
            totalProducts,
            activeProducts,
            inactiveProducts,
            topSellingProduct,
            topSellingProductByRevenue,
        };
    }

    private createProduct(payload: ProductPayload): Product {
        const category =
            (payload.categoryId &&
                this.state.categories.find(
                    (cat) => cat.id === payload.categoryId
                )) ||
            null;

        const newProduct: Product = {
            id: `prod-${Date.now()}`,
            name: payload.name,
            description: payload.description ?? null,
            imageUrl: payload.imageUrl ?? null,
            isActive: payload.isActive ?? true,
            unit: payload.unit ?? "PIECE",
            categoryId: category?.id ?? null,
            category,
            optionGroups: [],
            productGroup: payload.productGroup,
            basePrice: 0,
        };
        this.state.products = [newProduct, ...this.state.products];
        return newProduct;
    }

    private updateProduct(
        productId: string,
        payload: Partial<ProductPayload>
    ): Product {
        const index = this.state.products.findIndex(
            (product) => product.id === productId
        );
        if (index === -1) {
            throw new Error("Product not found");
        }
        const current = this.state.products[index];
        const category =
            payload.categoryId === undefined
                ? current.category
                : payload.categoryId
                ? this.state.categories.find(
                      (cat) => cat.id === payload.categoryId
                  ) ?? null
                : null;

        const updated: Product = {
            ...current,
            name: payload.name ?? current.name,
            description:
                payload.description !== undefined
                    ? payload.description ?? null
                    : current.description,
            imageUrl:
                payload.imageUrl !== undefined
                    ? payload.imageUrl
                    : current.imageUrl,
            isActive:
                payload.isActive !== undefined
                    ? payload.isActive
                    : current.isActive,
            unit: payload.unit ?? current.unit,
            categoryId: category?.id ?? null,
            category,
            productGroup: payload.productGroup ?? current.productGroup,
        };

        this.state.products[index] = updated;
        return updated;
    }

    private getDistributorDailyOrders(
        date: string
    ): DistributorDailyOrdersResponse {
        const orders = this.state.orders.filter(
            (order) => toDateKey(order.createdAt) === date
        );
        return {
            date,
            orders,
            summary: {
                totalOrders: orders.length,
                totalAmount: Number(
                    orders
                        .reduce(
                            (sum, order) => sum + (order.finalTotalAmount || 0),
                            0
                        )
                        .toFixed(2)
                ),
            },
        };
    }

    private getChefOrders(
        chef: DemoUser,
        query: URLSearchParams
    ) {
        const dateFilter = query.get("date");
        const page = Number(query.get("page") || "1");
        const limit = Number(query.get("limit") || "20");
        const targetDate = dateFilter || toDateKey(new Date().toISOString());
        const relevantOrders = this.state.orders.filter((order) => {
            if (toDateKey(order.createdAt) !== targetDate) return false;
            if (!chef.productGroup) return true;
            return order.items.some(
                (item) => item.product?.productGroup === chef.productGroup
            );
        });
        const response = paginate(relevantOrders, page, limit);
        return response;
    }

    private updateOrderItemStatus(
        itemId: string,
        patch: Partial<{
            productionStatus: "COMPLETED" | "CANCELLED" | "PARTIALLY_COMPLETED";
            producedQuantity?: number;
            notes?: string | null;
        }>
    ) {
        for (const order of this.state.orders) {
            const index = order.items.findIndex((item) => item.id === itemId);
            if (index === -1) continue;

            const current = order.items[index];
            let nextProduced = current.producedQuantity ?? 0;
            let nextStatus =
                patch.productionStatus ?? current.productionStatus ?? "PENDING";

            if (patch.producedQuantity !== undefined) {
                nextProduced = Math.min(
                    current.quantity,
                    nextProduced + patch.producedQuantity
                );
                if (nextProduced >= current.quantity) {
                    nextStatus = "COMPLETED";
                } else if (nextStatus === "PENDING") {
                    nextStatus = "PARTIALLY_COMPLETED";
                }
            }

            if (patch.productionStatus === "COMPLETED") {
                nextProduced = current.quantity;
            }
            if (patch.productionStatus === "CANCELLED") {
                nextProduced = current.quantity;
            }

            const updated = {
                ...current,
                productionStatus: nextStatus,
                producedQuantity: nextProduced,
                productionNotes: patch.notes ?? current.productionNotes,
            };
            order.items[index] = updated;
            return updated;
        }
        throw new Error("Order item not found");
    }

    private updateOrderItemDelivery(
        itemId: string,
        patch: Partial<{
            deliveredQuantity?: number;
            deliveryStatus?: Order["deliveryStatus"];
            deliveryNotes?: string | null;
        }>
    ) {
        for (const order of this.state.orders) {
            const index = order.items.findIndex((item) => item.id === itemId);
            if (index !== -1) {
                const updated = {
                    ...order.items[index],
                    deliveredQuantity:
                        patch.deliveredQuantity ??
                        order.items[index].deliveredQuantity,
                    deliveryStatus:
                        patch.deliveryStatus === "PARTIALLY_DELIVERED"
                            ? "PARTIAL"
                            : patch.deliveryStatus === "DELIVERED"
                            ? "DELIVERED"
                            : patch.deliveryStatus === "FAILED"
                            ? "FAILED"
                            : order.items[index].deliveryStatus,
                    deliveryNotes:
                        patch.deliveryNotes ?? order.items[index].deliveryNotes,
                };
                order.items[index] = updated;
                if (patch.deliveryStatus) {
                    order.deliveryStatus = patch.deliveryStatus;
                    order.deliveryNotes =
                        patch.deliveryNotes ?? order.deliveryNotes;
                }
                return updated;
            }
        }
        throw new Error("Order item not found");
    }

    private getOrdersResponse(
        query: URLSearchParams
    ) {
        const page = Number(query.get("page") || "1");
        const limit = Number(query.get("limit") || "10");
        const status = query.get("status");
        const search = query.get("search");
        let filtered = [...this.state.orders];
        if (status && status !== "ALL") {
            filtered = filtered.filter(
                (order) => order.deliveryStatus === status
            );
        }
        if (search) {
            const normalized = search.toLowerCase();
            filtered = filtered.filter((order) =>
                order.user?.companyName
                    ?.toLowerCase()
                    .includes(normalized)
            );
        }
        filtered.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
        const response = paginate(filtered, page, limit);
        return {
            data: response.data,
            pagination: {
                ...response.pagination,
                hasNextPage: response.pagination.hasNext,
                hasPrevPage: response.pagination.hasPrevious,
            },
            filters: {
                appliedFilters: {
                    status,
                    search,
                },
                availableFilters: {
                    statuses: [
                        { value: "READY_FOR_DELIVERY", label: "Ready", count: filtered.filter(o => o.deliveryStatus === "READY_FOR_DELIVERY").length },
                        { value: "DELIVERED", label: "Delivered", count: filtered.filter(o => o.deliveryStatus === "DELIVERED").length },
                        { value: "FAILED", label: "Failed", count: filtered.filter(o => o.deliveryStatus === "FAILED").length },
                        { value: "CANCELLED", label: "Cancelled", count: filtered.filter(o => o.deliveryStatus === "CANCELLED").length },
                    ],
                },
            },
        };
    }

    private getFavorites(user: DemoUser) {
        const ids = this.state.favorites[user.id] || [];
        return ids
            .map((productId) => {
                const product = this.state.products.find(
                    (item) => item.id === productId
                );
                if (!product) return null;
                return {
                    id: `${user.id}-${productId}`,
                    product,
                    addedAt: new Date().toISOString(),
                };
            })
            .filter(Boolean);
    }

    private toggleFavorite(user: DemoUser, productId: string) {
        if (!this.state.favorites[user.id]) {
            this.state.favorites[user.id] = [];
        }
        const entries = this.state.favorites[user.id];
        const existingIndex = entries.indexOf(productId);
        if (existingIndex >= 0) {
            entries.splice(existingIndex, 1);
            return null;
        }
        entries.push(productId);
        const product = this.state.products.find(
            (item) => item.id === productId
        );
        if (!product) {
            throw new Error("Product not found");
        }
        return {
            id: `${user.id}-${productId}`,
            product,
            addedAt: new Date().toISOString(),
        };
    }

    private getCart(user: DemoUser) {
        return { items: this.state.carts[user.id] ?? [] };
    }

    private addCartItem(user: DemoUser, payload: DemoCartItemPayload) {
        const current = this.state.carts[user.id] ?? [];
        const id = `cart-${Date.now()}`;
        const item = { id, ...payload };
        this.state.carts[user.id] = [...current, item];
        return { item };
    }

    private updateCartItem(
        user: DemoUser,
        itemId: string,
        patch: { quantity?: number }
    ) {
        const cart = this.state.carts[user.id] ?? [];
        const index = cart.findIndex((item) => item.id === itemId);
        if (index === -1) {
            throw new Error("Cart item not found");
        }
        cart[index] = { ...cart[index], ...patch };
        this.state.carts[user.id] = [...cart];
        return { item: cart[index] };
    }

    private removeCartItem(user: DemoUser, itemId: string) {
        const cart = this.state.carts[user.id] ?? [];
        this.state.carts[user.id] = cart.filter((item) => item.id !== itemId);
        return {};
    }

    private mergeCart(user: DemoUser, items: DemoCartItemPayload[]) {
        this.state.carts[user.id] = items.map((item, index) => ({
            id: `cart-${Date.now()}-${index}`,
            ...item,
        }));
        return { items: this.state.carts[user.id], merged: true };
    }

    private getCatalog(
        query: URLSearchParams
    ) {
        const page = Number(query.get("page") || "1");
        const limit = Number(query.get("limit") || "16");
        const categoryId = query.get("categoryId");
        const search = (query.get("search") || "").toLowerCase();
        let filtered = [...this.state.products].filter(
            (product) => product.isActive
        );
        if (categoryId) {
            filtered = filtered.filter(
                (product) => product.categoryId === categoryId
            );
        }
        if (search) {
            filtered = filtered.filter((product) =>
                product.name.toLowerCase().includes(search)
            );
        }
        const response = paginate(filtered, page, limit);
        return response;
    }

    public async request<T>(
        method: HttpMethod,
        rawUrl: string,
        config?: AxiosRequestConfig,
        data?: unknown
    ): Promise<T> {
        const { path, query } = this.parseUrl(rawUrl, config?.params);

        // Authentication endpoints
        if (method === "POST" && path === "/auth/login") {
            return this.handleLogin(data) as T;
        }

        if (method === "POST" && path === "/auth/register") {
            const payload = data as Partial<DemoUser> & {
                password: string;
            };
            if (!payload?.email) throw new Error("Email is required");
            const newUser: DemoUser = {
                id: `user-client-${Date.now()}`,
                email: payload.email,
                password: payload.password || "demo123",
                name: payload.name ?? "New",
                surname: payload.surname ?? "Client",
                role: "CLIENT",
                isActive: false,
                companyName: payload.companyName ?? "",
                address: payload.address ?? "",
                phone: payload.phone ?? null,
                assignedDistributorId: null,
                priceListId: "pl-retail-standard",
            };
            this.state.users.push(newUser);
            return {
                message:
                    "Registration successful, your account is waiting for admin approval.",
                user: this.toPublicUser(newUser),
            } as T;
        }

        // Users (admin)
        if (method === "GET" && path === "/users") {
            this.ensureAuth(config, ["ADMIN"]);
            return this.listUsers(query) as T;
        }

        if (method === "POST" && path === "/users") {
            this.ensureAuth(config, ["ADMIN"]);
            const payload = data as Partial<DemoUser> & {
                password?: string;
                role?: User["role"];
            };
            if (!payload?.email) {
                throw new Error("Email is required");
            }
            const newUser: DemoUser = {
                id: `user-${Date.now()}`,
                email: payload.email,
                password: payload.password || "demo123",
                name: payload.name ?? "New",
                surname: payload.surname ?? "User",
                role: payload.role ?? "CLIENT",
                isActive: payload.isActive ?? true,
                companyName: payload.companyName ?? "",
                address: payload.address ?? "",
                phone: payload.phone ?? null,
                assignedDistributorId: payload.assignedDistributorId ?? null,
                priceListId: payload.priceListId ?? "pl-retail-standard",
            };
            this.state.users.push(newUser);
            return this.toPublicUser(newUser) as T;
        }

        if (method === "GET" && path.startsWith("/users/")) {
            this.ensureAuth(config, ["ADMIN"]);
            const id = path.split("/")[2];
            const user = this.state.users.find((u) => u.id === id);
            if (!user) throw new Error("User not found");
            return this.toPublicUser(user) as T;
        }

        if (method === "PUT" && path.startsWith("/users/")) {
            const admin = this.ensureAuth(config, ["ADMIN"]);
            const segments = path.split("/");
            const id = segments[2];
            if (segments.length === 4) {
                if (segments[3] === "activate") {
                    const user = this.state.users.find((u) => u.id === id);
                    if (!user) throw new Error("User not found");
                    user.isActive = true;
                    return this.toPublicUser(user) as T;
                }
                if (segments[3] === "deactivate") {
                    if (id === admin.id) {
                        throw new Error("You cannot deactivate your own account");
                    }
                    const user = this.state.users.find((u) => u.id === id);
                    if (!user) throw new Error("User not found");
                    user.isActive = false;
                    return this.toPublicUser(user) as T;
                }
            }
            const index = this.state.users.findIndex((user) => user.id === id);
            if (index === -1) throw new Error("User not found");
            const payload = data as Partial<DemoUser>;
            this.state.users[index] = {
                ...this.state.users[index],
                ...payload,
                password:
                    payload.password || this.state.users[index].password,
            };
            return this.toPublicUser(this.state.users[index]) as T;
        }

        if (method === "DELETE" && path.startsWith("/users/")) {
            this.ensureAuth(config, ["ADMIN"]);
            const id = path.split("/")[2];
            this.state.users = this.state.users.filter(
                (user) => user.id !== id
            );
            return { message: "User deleted" } as T;
        }

        if (method === "GET" && path === "/profile") {
            const user = this.ensureAuth(config, [
                "ADMIN",
                "CLIENT",
                "CHEF",
                "DRIVER",
                "DISTRIBUTOR",
            ]);
            return this.toPublicUser(user) as T;
        }

        if (method === "PUT" && path === "/profile") {
            const user = this.ensureAuth(config, [
                "ADMIN",
                "CLIENT",
                "CHEF",
                "DRIVER",
                "DISTRIBUTOR",
            ]);
            const payload = data as Partial<DemoUser>;
            const index = this.state.users.findIndex(
                (u) => u.id === user.id
            );
            this.state.users[index] = {
                ...this.state.users[index],
                ...payload,
                password: this.state.users[index].password,
            };
            return this.toPublicUser(this.state.users[index]) as T;
        }

        if (method === "POST" && path === "/profile/change-password") {
            const user = this.ensureAuth(config, [
                "ADMIN",
                "CLIENT",
                "CHEF",
                "DRIVER",
                "DISTRIBUTOR",
            ]);
            const payload = data as { newPassword?: string };
            if (!payload?.newPassword) {
                throw new Error("New password is required");
            }
            user.password = payload.newPassword;
            return { message: "Password updated" } as T;
        }

        if (method === "GET" && path === "/admin/chefs") {
            this.ensureAuth(config, ["ADMIN"]);
            const chefs = this.state.users
                .filter((user) => user.role === "CHEF")
                .map((chef) => {
                    const { password: _unusedPassword, ...publicChef } = chef;
                    void _unusedPassword;
                    return publicChef;
                });
            return { chefs } as T;
        }

        if (
            method === "GET" &&
            path.startsWith("/admin/chefs/") &&
            path.endsWith("/product-group")
        ) {
            const id = path.split("/")[3];
            const chef = this.state.users.find(
                (user) => user.id === id && user.role === "CHEF"
            );
            if (!chef) {
                throw new Error("Chef not found");
            }
            return { chef: { productGroup: chef.productGroup } } as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/admin/chefs/") &&
            path.endsWith("/product-group")
        ) {
            const admin = this.ensureAuth(config, ["ADMIN"]);
            const id = path.split("/")[3];
            const chefIndex = this.state.users.findIndex(
                (user) => user.id === id && user.role === "CHEF"
            );
            if (chefIndex === -1) {
                throw new Error("Chef not found");
            }
            const payload = data as { productGroup: User["productGroup"] };
            this.state.users[chefIndex] = {
                ...this.state.users[chefIndex],
                productGroup: payload.productGroup,
            };
            const { password: _unusedPassword, ...publicChef } =
                this.state.users[chefIndex];
            void _unusedPassword;
            return { chef: publicChef, updatedBy: admin.id } as T;
        }

        // Customers summary
        if (
            method === "GET" &&
            path === "/admin/analytics/customers/summary"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return this.getCustomerSummary() as T;
        }

        // Admin dashboard
        if (
            method === "GET" &&
            path === "/admin/analytics/dashboard"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return this.getAdminDashboard() as T;
        }

        if (
            method === "POST" &&
            path === "/admin/analytics/test/create-data"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return { createdCount: 0, message: "Demo data already loaded." } as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/cache/stats"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return {
                hitRate: 0.92,
                entries: 4,
                ttlSeconds: 3600,
                lastUpdatedAt: new Date().toISOString(),
            } as T;
        }

        if (
            method === "POST" &&
            path === "/admin/analytics/cache/clear"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return { cleared: true, message: "Analytics cache cleared." } as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/production"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return this.getProductionAnalytics() as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/financials"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return this.getFinancialsReport(query) as T;
        }

        if (
            method === "GET" &&
            path === "/admin/production-list/all"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const date = query.get("date") || toDateKey(new Date().toISOString());
            return this.getProductionList(date) as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/orders"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return this.getOrdersResponse(query) as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/customers"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const { data, pagination } = this.getEnhancedCustomersData(query);
            return {
                data: data.map((row) => ({
                    userId: row.userId,
                    orderCount: row.orderCount,
                    totalSpending: row.totalSpending,
                    totalInitial: row.totalSpending,
                    aov: row.averageOrderValue,
                    savingsOrDiscount: 0,
                    user: {
                        id: row.userId,
                        email:
                            this.state.users.find((u) => u.id === row.userId)
                                ?.email ?? "",
                        name:
                            this.state.users.find((u) => u.id === row.userId)
                                ?.name ?? "",
                        surname:
                            this.state.users.find((u) => u.id === row.userId)
                                ?.surname ?? "",
                    },
                })),
                pagination,
            } as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/customers/kpi"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return this.getCustomerKpiMetrics(query) as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/customers/top"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const limit = Number(query.get("limit") || "5");
            return this.getTopCustomersData(limit) as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/customers/acquisition-trend"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const months = Number(query.get("months") || "6");
            return this.getAcquisitionTrendData(months) as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/customers/enhanced"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return this.getEnhancedCustomersData(query) as T;
        }

        if (
            method === "GET" &&
            path === "/admin/analytics/customers/at-risk"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return { data: [] } as T;
        }

        if (method === "GET" && path === "/admin/price-lists") {
            this.ensureAuth(config, ["ADMIN", "DISTRIBUTOR"]);
            const lists: PriceListSummary[] = this.state.priceLists.map(
                (list) => {
                    const { prices: _ignoredPrices, ...summary } = list;
                    void _ignoredPrices;
                    return summary;
                }
            );
            return lists as T;
        }
        if (method === "GET" && path === "/distributor/price-lists") {
            const distributor = this.ensureAuth(config, ["DISTRIBUTOR"]);
            const lists = this.state.priceLists
                .filter(
                    (list) =>
                        list.distributorId === distributor.id ||
                        list.distributorId === null
                )
                .map((list) => {
                    const { prices: _ignoredPrices, ...summary } = list;
                    void _ignoredPrices;
                    return summary;
                });
            return lists as T;
        }
        if (method === "POST" && path === "/distributor/price-lists") {
            const distributor = this.ensureAuth(config, ["DISTRIBUTOR"]);
            const payload = data as { name: string; type?: string };
            const newList: PriceListDetail = {
                id: `pl-${Date.now()}`,
                name: payload.name || "New Distributor List",
                isDefault: false,
                type: (payload.type as "WHOLESALE" | "RETAIL") ?? "WHOLESALE",
                distributorId: distributor.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                prices: [],
            };
            this.state.priceLists.push(newList);
            return newList as T;
        }
        if (method === "POST" && path === "/admin/price-lists") {
            this.ensureAuth(config, ["ADMIN", "DISTRIBUTOR"]);
            const payload = data as {
                name: string;
                type?: string;
                isDefault?: boolean;
            };
            const newList: PriceListDetail = {
                id: `pl-${Date.now()}`,
                name: payload.name || "New Price List",
                isDefault: payload.isDefault ?? false,
                type: payload.type as "WHOLESALE" | "RETAIL" | undefined,
                distributorId:
                    payload.type === "WHOLESALE"
                        ? this.getUserFromConfig(config)?.id ?? null
                        : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                prices: [],
            };
            if (newList.isDefault) {
                this.state.priceLists = this.state.priceLists.map((list) => ({
                    ...list,
                    isDefault: false,
                }));
            }
            this.state.priceLists.push(newList);
            return newList as T;
        }

        if (
            method === "GET" &&
            path.startsWith("/admin/price-lists/")
        ) {
            this.ensureAuth(config, ["ADMIN", "DISTRIBUTOR"]);
            const id = path.split("/")[3];
            const detail = this.state.priceLists.find(
                (list) => list.id === id
            );
            if (!detail) {
                throw new Error("Price list not found");
            }
            return detail as T;
        }
        if (
            method === "GET" &&
            path.startsWith("/distributor/price-lists/")
        ) {
            this.ensureAuth(config, ["DISTRIBUTOR"]);
            const id = path.split("/")[3];
            const detail = this.state.priceLists.find(
                (list) => list.id === id
            );
            if (!detail) throw new Error("Price list not found");
            return detail as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/admin/price-lists/")
        ) {
            this.ensureAuth(config, ["ADMIN", "DISTRIBUTOR"]);
            const id = path.split("/")[3];
            const index = this.state.priceLists.findIndex(
                (list) => list.id === id
            );
            if (index === -1) {
                throw new Error("Price list not found");
            }
            const payload = data as {
                items: Array<{
                    optionItemId: string;
                    price?: number;
                    multiplier?: number;
                }>;
            };
            this.state.priceLists[index] = {
                ...this.state.priceLists[index],
                prices: payload.items.map((item, idx) => ({
                    id: `${id}-price-${idx}`,
                    optionItemId: item.optionItemId,
                    priceListId: id,
                    price: item.price ?? null,
                    multiplier: item.multiplier ?? null,
                })),
                updatedAt: new Date().toISOString(),
            };
            return this.state.priceLists[index] as T;
        }

        if (
            method === "PATCH" &&
            path.startsWith("/admin/price-lists/") &&
            path.endsWith("/default")
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const id = path.split("/")[3];
            this.state.priceLists = this.state.priceLists.map((list) => ({
                ...list,
                isDefault: list.id === id,
            }));
            const detail = this.state.priceLists.find((list) => list.id === id)!;
            return detail as T;
        }

        if (
            method === "DELETE" &&
            path.startsWith("/admin/price-lists/")
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const id = path.split("/")[3];
            this.state.priceLists = this.state.priceLists.filter(
                (list) => list.id !== id
            );
            return {
                message: "Price list deleted",
                data: {
                    reassignedUsersCount: 0,
                    reassignedUsers: [],
                },
            } as T;
        }

        if (method === "GET" && path === "/distributor/clients") {
            const distributor = this.ensureAuth(config, ["DISTRIBUTOR", "ADMIN"]);
            const page = Number(query.get("page") || "1");
            const limit = Number(query.get("limit") || "10");
            const clients = this.getClientsForDistributor(distributor);
            const sorted = [...clients].sort((a, b) => {
                const aLabel = a.companyName || `${a.name} ${a.surname}`.trim();
                const bLabel = b.companyName || `${b.name} ${b.surname}`.trim();
                return aLabel.localeCompare(bLabel);
            });
            const paged = paginate(sorted, page, limit);
            return {
                data: paged.data.map((client) => this.toPublicUser(client)),
                pagination: paged.pagination,
            } as T;
        }

        if (path.startsWith("/distributor/clients/")) {
            const distributor = this.ensureAuth(config, ["DISTRIBUTOR", "ADMIN"]);
            const segments = path.split("/");
            const clientId = segments[3];
            if (!clientId) {
                throw new Error("Client ID missing");
            }

            const client = this.state.users.find(
                (user) => user.id === clientId && user.role === "CLIENT"
            );
            if (!client || !this.canAccessClient(distributor, client)) {
                throw new Error("Client not found");
            }

            if (segments.length === 4 && method === "GET") {
                return this.buildDistributorClientDetail(client) as T;
            }

            if (
                segments.length === 5 &&
                segments[4] === "price-list" &&
                method === "PUT"
            ) {
                const payload = (data as { priceListId?: string | null }) ?? {};
                const nextPriceListId =
                    payload.priceListId === undefined
                        ? null
                        : payload.priceListId;
                if (nextPriceListId) {
                    const targetList = this.state.priceLists.find(
                        (list) => list.id === nextPriceListId
                    );
                    if (!targetList) {
                        throw new Error("Price list not found");
                    }
                    if (
                        distributor.role === "DISTRIBUTOR" &&
                        targetList.distributorId &&
                        targetList.distributorId !== distributor.id
                    ) {
                        throw new Error("You cannot assign this price list.");
                    }
                }
                client.priceListId = nextPriceListId;
                return this.toPublicUser(client) as T;
            }

            if (
                segments.length === 5 &&
                segments[4] === "orders" &&
                method === "GET"
            ) {
                const page = Number(query.get("page") || "1");
                const limit = Number(query.get("limit") || "10");
                const clientOrders = this.state.orders
                    .filter((order) => order.user?.id === client.id)
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    );
                return paginate(clientOrders, page, limit) as T;
            }
        }

        // Orders (admin)
        if (method === "GET" && path === "/admin/orders") {
            this.ensureAuth(config, ["ADMIN"]);
            return this.getOrdersResponse(query) as T;
        }

        if (
            method === "GET" &&
            path.startsWith("/admin/orders/")
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const userId = path.split("/")[3];
            const page = Number(query.get("page") || "1");
            const limit = Number(query.get("limit") || "10");
            const orders = this.state.orders.filter(
                (order) => order.user?.id === userId
            );
            return paginate(orders, page, limit) as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/admin/orders/") &&
            path.endsWith("/cancel")
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const orderId = path.split("/")[3];
            const orderIndex = this.state.orders.findIndex(
                (order) => order.id === orderId
            );
            if (orderIndex === -1) {
                throw new Error("Order not found");
            }
            this.state.orders[orderIndex] = {
                ...this.state.orders[orderIndex],
                deliveryStatus: "CANCELLED",
                productionStatus: "CANCELLED",
                deliveryNotes: (data as { notes?: string })?.notes ?? null,
            };
            return {
                success: true,
                message: "Order cancelled successfully",
                order: this.state.orders[orderIndex],
            } as T;
        }

        // Client orders
        if (method === "GET" && path === "/orders") {
            const user = this.ensureAuth(config, ["CLIENT"]);
            const page = Number(query.get("page") || "1");
            const limit = Number(query.get("limit") || "10");
            const userOrders = this.state.orders.filter(
                (order) => order.user?.id === user.id
            );
            const response = paginate(userOrders, page, limit);
            return response as T;
        }

        if (method === "POST" && path === "/orders") {
            const user = this.ensureAuth(config, ["CLIENT"]);
            const payload = data as {
                items: Array<{
                    productId: string;
                    quantity: number;
                    selectedOptionItemIds: string[];
                }>;
                notes?: string;
            };
            const newId = `ord-${Date.now()}`;
            const newOrder = createOrder(newId, {
                number: Math.floor(1000 + Math.random() * 9000),
                clientId: user.id,
                createdAt: new Date().toISOString(),
                status: "PENDING",
                productionStatus: "PENDING",
                items: payload.items.map((item, index) => ({
                    id: `${newId}-item-${index}`,
                    productId: item.productId,
                    quantity: item.quantity,
                    selectionIds: item.selectedOptionItemIds,
                    productionStatus: "PENDING",
                    unitPrice: 120,
                    totalPrice: 120 * item.quantity,
                })),
                notes: payload.notes,
            });
            this.state.orders = [newOrder, ...this.state.orders];
            return newOrder as T;
        }

        if (
            method === "GET" &&
            path.startsWith("/orders/")
        ) {
            const user = this.ensureAuth(config, [
                "ADMIN",
                "CLIENT",
                "DRIVER",
                "CHEF",
            ]);
            const id = path.split("/")[2];
            const order = this.state.orders.find((o) => o.id === id);
            if (!order) throw new Error("Order not found");
            if (
                user.role === "CLIENT" &&
                order.user?.id !== user.id
            ) {
                throw new Error("You cannot view this order");
            }
            return order as T;
        }

        // Favorites
        if (method === "GET" && path === "/favorites") {
            const user = this.ensureAuth(config, ["CLIENT"]);
            return this.getFavorites(user) as T;
        }

        if (method === "POST" && path === "/favorites") {
            const user = this.ensureAuth(config, ["CLIENT"]);
            const payload = data as { productId: string };
            const favorite = this.toggleFavorite(user, payload.productId);
            if (!favorite) {
                throw new Error("Favorite removed");
            }
            return favorite as T;
        }

        if (
            method === "DELETE" &&
            path.startsWith("/favorites/")
        ) {
            const user = this.ensureAuth(config, ["CLIENT"]);
            const productId = path.split("/")[2];
            const entries = this.state.favorites[user.id] ?? [];
            this.state.favorites[user.id] = entries.filter(
                (id) => id !== productId
            );
            return {} as T;
        }

        if (
            method === "GET" &&
            path.startsWith("/favorites/check/")
        ) {
            const user = this.ensureAuth(config, ["CLIENT"]);
            const productId = path.split("/")[3];
            const isFavorite = (this.state.favorites[user.id] || []).includes(
                productId
            );
            return { isFavorite } as T;
        }

        if (method === "GET" && path === "/favorites/count") {
            const user = this.ensureAuth(config, ["CLIENT"]);
            return {
                count: (this.state.favorites[user.id] || []).length,
            } as T;
        }

        // Cart
        if (method === "GET" && path === "/cart") {
            const user = this.ensureAuth(config, ["CLIENT"]);
            return this.getCart(user) as T;
        }

        if (method === "POST" && path === "/cart/items") {
            const user = this.ensureAuth(config, ["CLIENT"]);
            return this.addCartItem(
                user,
                data as DemoCartItemPayload
            ) as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/cart/items/")
        ) {
            const user = this.ensureAuth(config, ["CLIENT"]);
            const id = path.split("/")[3];
            return this.updateCartItem(
                user,
                id,
                data as { quantity?: number }
            ) as T;
        }

        if (
            method === "DELETE" &&
            path.startsWith("/cart/items/")
        ) {
            const user = this.ensureAuth(config, ["CLIENT"]);
            const id = path.split("/")[3];
            return this.removeCartItem(user, id) as T;
        }

        if (method === "POST" && path === "/cart/merge") {
            const user = this.ensureAuth(config, ["CLIENT"]);
            const payload = data as { items: DemoCartItemPayload[] };
            return this.mergeCart(user, payload.items) as T;
        }

        // Catalog
        if (method === "GET" && path === "/products") {
            const response = this.getCatalog(query);
            return response as T;
        }

        if (method === "GET" && path === "/client/products") {
            this.ensureAuth(config, ["CLIENT"]);
            const response = this.getCatalog(query);
            return response as T;
        }

        if (
            method === "GET" &&
            path === "/admin/products/statistics"
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            return this.getProductStatistics() as T;
        }

        if (method === "POST" && path === "/admin/products") {
            this.ensureAuth(config, ["ADMIN"]);
            return this.createProduct(data as ProductPayload) as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/admin/products/") &&
            path.split("/").length === 4
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const id = path.split("/")[3];
            return this.updateProduct(id, data as Partial<ProductPayload>) as T;
        }

        if (method === "GET" && path === "/admin/products") {
            this.ensureAuth(config, ["ADMIN"]);
            const page = Number(query.get("page") || "1");
            const limit = Number(query.get("limit") || "12");
            const categoryId = query.get("categoryId");
            const search = (query.get("search") || "").toLowerCase();
            let filtered = [...this.state.products];
            if (categoryId) {
                filtered = filtered.filter(
                    (product) => product.categoryId === categoryId
                );
            }
            if (search) {
                filtered = filtered.filter((product) =>
                    product.name.toLowerCase().includes(search)
                );
            }
            return paginate(filtered, page, limit) as T;
        }

        if (
            method === "GET" &&
            path.startsWith("/admin/products/") &&
            path.split("/").length === 4
        ) {
            this.ensureAuth(config, ["ADMIN"]);
            const id = path.split("/")[3];
            const product = this.state.products.find((p) => p.id === id);
            if (!product) throw new Error("Product not found");
            return product as T;
        }

        if (method === "GET" && path === "/products/categories") {
            return this.state.categories as T;
        }

        if (method === "POST" && path === "/products/by-ids") {
            const payload = data as { productIds: string[] };
            const list = this.state.products.filter((product) =>
                payload.productIds.includes(product.id)
            );
            return list as T;
        }

        if (method === "POST" && path === "/client/products/by-ids") {
            this.ensureAuth(config, ["CLIENT"]);
            const payload = data as { productIds: string[] };
            const list = this.state.products.filter((product) =>
                payload.productIds.includes(product.id)
            );
            return list as T;
        }

        if (
            method === "GET" &&
            path === "/distributor/daily-client-summary"
        ) {
            this.ensureAuth(config, ["DISTRIBUTOR", "ADMIN"]);
            const date = query.get("date") || toDateKey(new Date().toISOString());
            return this.getDistributorDailyClientSummary(date) as T;
        }

        if (
            method === "GET" &&
            path === "/distributor/daily-product-summary"
        ) {
            this.ensureAuth(config, ["DISTRIBUTOR", "ADMIN"]);
            const date = query.get("date") || toDateKey(new Date().toISOString());
            return this.getDistributorDailyProductSummary(date) as T;
        }

        if (method === "GET" && path === "/distributor/daily-orders") {
            this.ensureAuth(config, ["DISTRIBUTOR", "ADMIN"]);
            const date = query.get("date") || toDateKey(new Date().toISOString());
            return this.getDistributorDailyOrders(date) as T;
        }

        if (
            method === "GET" &&
            path.startsWith("/distributor/orders/")
        ) {
            this.ensureAuth(config, ["DISTRIBUTOR", "ADMIN"]);
            const id = path.split("/")[3];
            const order = this.state.orders.find((o) => o.id === id);
            if (!order) throw new Error("Order not found");
            return order as T;
        }

        if (method === "GET" && path === "/chef/production-list") {
            const chef = this.ensureAuth(config, ["CHEF"]);
            const date = query.get("date") || toDateKey(new Date().toISOString());
            const list = this.getProductionList(date).filter((item) =>
                chef.productGroup ? item.productGroup === chef.productGroup : true
            );
            return list as T;
        }

        if (
            method === "GET" &&
            path === "/chef/production-list-by-group"
        ) {
            const chef = this.ensureAuth(config, ["CHEF"]);
            const date = query.get("date") || toDateKey(new Date().toISOString());
            const list = this.getProductionList(date).filter((item) =>
                chef.productGroup ? item.productGroup === chef.productGroup : true
            );
            return {
                productionList: list,
            } as T;
        }

        if (method === "GET" && path === "/chef/orders") {
            const chef = this.ensureAuth(config, ["CHEF"]);
            return this.getChefOrders(chef, query) as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/chef/order-items/") &&
            path.endsWith("/status")
        ) {
            this.ensureAuth(config, ["CHEF"]);
            const id = path.split("/")[3];
            const payload = data as {
                status: "COMPLETED" | "CANCELLED" | "PARTIALLY_COMPLETED";
                notes?: string | null;
            };
            const orderItem = this.updateOrderItemStatus(id, {
                productionStatus: payload.status,
                notes: payload.notes ?? null,
            });
            return { orderItem } as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/chef/order-items/") &&
            path.endsWith("/produce")
        ) {
            this.ensureAuth(config, ["CHEF"]);
            const id = path.split("/")[3];
            const payload = data as { amount: number; notes?: string };
            const orderItem = this.updateOrderItemStatus(id, {
                productionStatus: "PARTIALLY_COMPLETED",
                producedQuantity: payload.amount,
                notes: payload.notes ?? "",
            });
            return { orderItem } as T;
        }

        if (method === "GET" && path === "/driver/orders/pool") {
            this.ensureAuth(config, ["DRIVER"]);
            const page = Number(query.get("page") || "1");
            const limit = Number(query.get("limit") || "20");
            const readyOrders = this.state.orders.filter(
                (order) =>
                    order.deliveryStatus === "READY_FOR_DELIVERY" &&
                    !order.deliveredByUserId
            );
            return paginate(readyOrders, page, limit) as T;
        }

        if (method === "GET" && path === "/driver/orders/my-deliveries") {
            const driver = this.ensureAuth(config, ["DRIVER"]);
            const page = Number(query.get("page") || "1");
            const limit = Number(query.get("limit") || "20");
            const dateFilter = query.get("date");
            const statusFilters = query.getAll("status");
            let deliveries = this.state.orders.filter(
                (order) => order.deliveredByUserId === driver.id
            );
            if (dateFilter) {
                deliveries = deliveries.filter(
                    (order) => toDateKey(order.createdAt) === dateFilter
                );
            }
            if (statusFilters.length > 0) {
                deliveries = deliveries.filter((order) =>
                    statusFilters.includes(order.deliveryStatus)
                );
            }
            return paginate(deliveries, page, limit) as T;
        }

        if (method === "GET" && path === "/driver/orders") {
            const driver = this.ensureAuth(config, ["DRIVER"]);
            const page = Number(query.get("page") || "1");
            const limit = Number(query.get("limit") || "25");
            const statusFilters = query.getAll("status");
            const dateFilter = query.get("date");
            let orders = this.state.orders.filter(
                (order) =>
                    order.deliveryStatus === "READY_FOR_DELIVERY" ||
                    order.deliveredByUserId === driver.id
            );
            if (dateFilter) {
                orders = orders.filter(
                    (order) => toDateKey(order.createdAt) === dateFilter
                );
            }
            if (statusFilters.length > 0) {
                orders = orders.filter((order) =>
                    statusFilters.includes(order.deliveryStatus)
                );
            }
            return paginate(orders, page, limit) as T;
        }

        if (method === "GET" && path === "/driver/orders/all") {
            this.ensureAuth(config, ["DRIVER"]);
            return { orders: this.state.orders } as T;
        }

        if (
            method === "GET" &&
            path.startsWith("/driver/orders/")
        ) {
            const driver = this.ensureAuth(config, ["DRIVER"]);
            const id = path.split("/")[3];
            const order = this.state.orders.find((o) => o.id === id);
            if (!order) throw new Error("Order not found");
            if (
                order.deliveredByUserId &&
                order.deliveredByUserId !== driver.id &&
                order.deliveryStatus !== "READY_FOR_DELIVERY"
            ) {
                throw new Error("You cannot view this delivery");
            }
            return order as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/driver/orders/") &&
            path.endsWith("/claim")
        ) {
            const driver = this.ensureAuth(config, ["DRIVER"]);
            const id = path.split("/")[3];
            const order = this.state.orders.find((o) => o.id === id);
            if (!order) throw new Error("Order not found");
            if (order.deliveredByUserId) {
                throw new Error("Order already claimed");
            }
            order.deliveredByUserId = driver.id;
            order.deliveredByUser = {
                name: driver.name,
                surname: driver.surname,
            };
            return order as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/driver/orders/") &&
            path.endsWith("/status")
        ) {
            const driver = this.ensureAuth(config, ["DRIVER"]);
            const id = path.split("/")[3];
            const order = this.state.orders.find((o) => o.id === id);
            if (!order) throw new Error("Order not found");
            const payload = data as {
                status: "DELIVERED" | "FAILED";
                notes?: string | null;
            };
            order.deliveryStatus = payload.status;
            order.deliveryNotes = payload.notes ?? null;
            order.deliveredByUserId = driver.id;
            order.deliveredByUser = {
                name: driver.name,
                surname: driver.surname,
            };
            order.deliveredAt = new Date().toISOString();
            return order as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/driver/order-items/") &&
            path.endsWith("/deliver")
        ) {
            const driver = this.ensureAuth(config, ["DRIVER"]);
            const id = path.split("/")[3];
            const payload = data as { amount: number; notes?: string };
            const orderItem = this.updateOrderItemDelivery(id, {
                deliveredQuantity: payload.amount,
                deliveryStatus: "PARTIALLY_DELIVERED",
                deliveryNotes: payload.notes ?? null,
            });
            return { orderItem, driver: driver.id } as T;
        }

        if (
            method === "PUT" &&
            path.startsWith("/driver/order-items/") &&
            path.endsWith("/cannot-deliver")
        ) {
            this.ensureAuth(config, ["DRIVER"]);
            const id = path.split("/")[3];
            const payload = data as { notes: string };
            const orderItem = this.updateOrderItemDelivery(id, {
                deliveryStatus: "FAILED",
                deliveryNotes: payload.notes,
            });
            return { orderItem } as T;
        }

        // Default handler
        throw new Error(`No mock implemented for ${method} ${path}`);
    }
}

export const mockServer = new MockServer();
type ProductStatisticsSnapshot = {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    topSellingProduct?: { id: string; name: string; salesCount: number };
    topSellingProductByRevenue?: {
        id: string;
        name: string;
        totalRevenue: number;
    };
};
