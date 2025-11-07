import type {
    Order,
    PriceListDetail,
    Product,
    User,
} from "@/types/data";

export type DemoUser = User & {
    password: string;
    phone?: string | null;
};

export interface DemoCartItem {
    id: string;
    productId: string;
    quantity: number;
    selectedOptionItemIds: string[];
    unitPrice?: number;
    totalPrice?: number;
}

export interface DemoCartItemPayload {
    productId: string;
    quantity: number;
    selectedOptionItemIds: string[];
}

export interface DemoPriceListDetail extends PriceListDetail {
    prices: PriceListDetail["prices"];
}

export interface DemoState {
    users: DemoUser[];
    categories: Array<{ id: string; name: string }>;
    products: Product[];
    priceLists: DemoPriceListDetail[];
    orders: Order[];
    favorites: Record<string, string[]>;
    carts: Record<string, DemoCartItem[]>;
    customersAnalytics: {
        summary: {
            totalCustomers: number;
            activeCustomers: number;
            inactiveCustomers: number;
        };
    };
    metadata: {
        lastUpdated: string;
    };
}

export interface MockRequestContext {
    tokenUser: DemoUser | null;
}
