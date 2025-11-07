import type {
    Order,
    OrderItem,
    PriceListItem,
    Product,
} from "@/types/data";
import { DEMO_DATA_VERSION } from "@/config/demo";
import type { DemoState, DemoUser } from "./types";

const now = new Date();
const todayIso = now.toISOString();
const isoDaysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
};

const categories = [
    { id: "cat-desserts", name: "Desserts" },
    { id: "cat-bakery", name: "Artisan Bakery" },
    { id: "cat-savory", name: "Savory Bites" },
];

const products: Product[] = [
    {
        id: "prod-baklava",
        name: "Pistachio Baklava Tray",
        description:
            "Golden filo, roasted pistachio crumble and our signature honey syrup.",
        imageUrl: "/demo/turkish-baklava-with-pistachio-823864.jpeg",
        isActive: true,
        unit: "TRAY",
        categoryId: "cat-desserts",
        category: categories[0],
        productGroup: "SWEETS",
        basePrice: 180,
        optionGroups: [
            {
                id: "opt-baklava-tray",
                name: "Tray Size",
                isRequired: true,
                allowMultiple: false,
                items: [
                    {
                        id: "opt-baklava-tray-small",
                        name: "24 bite tray",
                        priceAdjustment: 0,
                        multiplier: 1,
                    },
                    {
                        id: "opt-baklava-tray-medium",
                        name: "36 bite tray",
                        priceAdjustment: 55,
                        multiplier: 1.35,
                    },
                    {
                        id: "opt-baklava-tray-large",
                        name: "48 bite tray",
                        priceAdjustment: 110,
                        multiplier: 1.7,
                    },
                ],
            },
            {
                id: "opt-baklava-toppings",
                name: "Finish",
                isRequired: false,
                allowMultiple: true,
                items: [
                    {
                        id: "opt-baklava-rose",
                        name: "Organic rose petals",
                        priceAdjustment: 18,
                        multiplier: 0.2,
                    },
                    {
                        id: "opt-baklava-gold",
                        name: "24k gold leaf shards",
                        priceAdjustment: 45,
                        multiplier: 0.5,
                    },
                ],
            },
        ],
    },
    {
        id: "prod-kunefe",
        name: "Kunafa Cheesecake Squares",
        description:
            "Individual kunafa nests with mascarpone, orange blossom and pistachio dust.",
        imageUrl: "/demo/premium-assorted-baklava-box-aya-sofya-411911.jpeg",
        isActive: true,
        unit: "PIECE",
        categoryId: "cat-desserts",
        category: categories[0],
        productGroup: "SWEETS",
        basePrice: 32,
        optionGroups: [
            {
                id: "opt-kunafa-pack",
                name: "Box Size",
                isRequired: true,
                allowMultiple: false,
                items: [
                    {
                        id: "opt-kunafa-6",
                        name: "Box of 6",
                        priceAdjustment: 0,
                        multiplier: 1,
                    },
                    {
                        id: "opt-kunafa-12",
                        name: "Box of 12",
                        priceAdjustment: 180,
                        multiplier: 3,
                    },
                ],
            },
        ],
    },
    {
        id: "prod-sourdough",
        name: "Heritage Sourdough Loaf",
        description:
            "48 hour fermented wheat with smoked sea salt crust - ideal for brunch service.",
        imageUrl: "/demo/simit-turkish-bagel-4pcs-341061.jpeg",
        isActive: true,
        unit: "PIECE",
        categoryId: "cat-bakery",
        category: categories[1],
        productGroup: "BAKERY",
        basePrice: 28,
        optionGroups: [
            {
                id: "opt-sourdough-finish",
                name: "Finish",
                isRequired: true,
                allowMultiple: false,
                items: [
                    {
                        id: "opt-sourdough-classic",
                        name: "Classic crust",
                        priceAdjustment: 0,
                        multiplier: 1,
                    },
                    {
                        id: "opt-sourdough-dukkah",
                        name: "Hazelnut dukkah crust",
                        priceAdjustment: 6,
                        multiplier: 1.15,
                    },
                ],
            },
        ],
    },
    {
        id: "prod-mini-quiche",
        name: "Mini Quiche Flight",
        description:
            "Bite sized butter crust quiches in smoked salmon, truffle mushroom and spinach feta.",
        imageUrl: "/demo/pogaca-turkish-savory-pastry-4pcs-291291.jpeg",
        isActive: true,
        unit: "PIECE",
        categoryId: "cat-savory",
        category: categories[2],
        productGroup: "BAKERY",
        basePrice: 18,
        optionGroups: [
                {
                    id: "opt-quiche-pack",
                    name: "Pack Size",
                    isRequired: true,
                    allowMultiple: false,
                    items: [
                        {
                            id: "opt-quiche-12",
                            name: "Pack of 12",
                            priceAdjustment: 0,
                            multiplier: 1,
                        },
                        {
                            id: "opt-quiche-24",
                            name: "Pack of 24",
                            priceAdjustment: 180,
                            multiplier: 2.1,
                        },
                    ],
                },
            ],
    },
    {
        id: "prod-babka",
        name: "Chocolate Pistachio Babka",
        description:
            "Slow fermented brioche swirl with 70% chocolate ganache and pistachio praline.",
        imageUrl: "/demo/sesame-bun.jpeg",
        isActive: true,
        unit: "PIECE",
        categoryId: "cat-bakery",
        category: categories[1],
        productGroup: "BAKERY",
        basePrice: 45,
        optionGroups: [
            {
                id: "opt-babka-finish",
                name: "Finish",
                isRequired: false,
                allowMultiple: true,
                items: [
                    {
                        id: "opt-babka-caramel",
                        name: "Salted caramel drizzle",
                        priceAdjustment: 12,
                        multiplier: 0.25,
                    },
                    {
                        id: "opt-babka-praline",
                        name: "Hazelnut praline shards",
                        priceAdjustment: 18,
                        multiplier: 0.4,
                    },
                ],
            },
        ],
    },
    {
        id: "prod-pistachio-latte",
        name: "Pistachio Milk Base",
        description:
            "Barista-ready pistachio milk base for signature iced beverages.",
        imageUrl: "/demo/trilece-milk-cake-caramel-318049.jpeg",
        isActive: true,
        unit: "KG",
        categoryId: "cat-savory",
        category: categories[2],
        productGroup: "SWEETS",
        basePrice: 120,
        optionGroups: [
            {
                id: "opt-pistachio-pack",
                name: "Pack Size",
                isRequired: true,
                allowMultiple: false,
                items: [
                    {
                        id: "opt-pistachio-2kg",
                        name: "2 KG pouch",
                        priceAdjustment: 0,
                        multiplier: 1,
                    },
                    {
                        id: "opt-pistachio-5kg",
                        name: "5 KG pouch",
                        priceAdjustment: 180,
                        multiplier: 2.6,
                    },
                ],
            },
        ],
    },
];

const users: DemoUser[] = [
    {
        id: "user-admin-ada",
        email: "admin@sproject.demo",
        password: "demo123",
        name: "Ada",
        surname: "Karaca",
        role: "ADMIN",
        isActive: true,
        companyName: "SProject HQ",
        address: "Dubai Design District",
        phone: "+971500000001",
    },
    {
        id: "user-client-lina",
        email: "lina@palmbistro.demo",
        password: "demo123",
        name: "Lina",
        surname: "Al Farsi",
        role: "CLIENT",
        isActive: true,
        companyName: "Palm Bistro Group",
        address: "Palm Jumeirah, Dubai",
        assignedDistributorId: "user-distributor-nadia",
        priceListId: "pl-retail-standard",
        phone: "+971500000210",
    },
    {
        id: "user-client-omar",
        email: "omar@sunrisecatering.demo",
        password: "demo123",
        name: "Omar",
        surname: "Rahman",
        role: "CLIENT",
        isActive: true,
        companyName: "Sunrise Catering",
        address: "Dubai Media City",
        assignedDistributorId: "user-distributor-nadia",
        priceListId: "pl-retail-standard",
        phone: "+971500000365",
    },
    {
        id: "user-client-dina",
        email: "dina@levantlounge.demo",
        password: "demo123",
        name: "Dina",
        surname: "Haddad",
        role: "CLIENT",
        isActive: false,
        companyName: "Levant Lounge",
        address: "Abu Dhabi Corniche",
        assignedDistributorId: "user-distributor-nadia",
        priceListId: "pl-retail-standard",
    },
    {
        id: "user-chef-selim",
        email: "chef.selim@sproject.demo",
        password: "demo123",
        name: "Selim",
        surname: "Gursoy",
        role: "CHEF",
        isActive: true,
        companyName: "Production Lab",
        address: "Al Quoz Kitchen",
        productGroup: "SWEETS",
    },
    {
        id: "user-chef-leyla",
        email: "chef.leyla@sproject.demo",
        password: "demo123",
        name: "Leyla",
        surname: "Demir",
        role: "CHEF",
        isActive: true,
        companyName: "Production Lab",
        address: "Al Quoz Kitchen",
        productGroup: "BAKERY",
    },
    {
        id: "user-driver-yusuf",
        email: "driver.yusuf@sproject.demo",
        password: "demo123",
        name: "Yusuf",
        surname: "Iskandar",
        role: "DRIVER",
        isActive: true,
        companyName: "Dispatch Fleet",
        address: "Al Quoz",
    },
    {
        id: "user-distributor-nadia",
        email: "nadia@coastaldist.demo",
        password: "demo123",
        name: "Nadia",
        surname: "Saab",
        role: "DISTRIBUTOR",
        isActive: true,
        companyName: "Coastal Distributors",
        address: "JLT, Dubai",
    },
];

const priceListItems = (listId: string): PriceListItem[] => {
    const entries: Array<{
        optionItemId: string;
        price: number;
    }> = [
        { optionItemId: "opt-baklava-tray-small", price: 180 },
        { optionItemId: "opt-baklava-tray-medium", price: 235 },
        { optionItemId: "opt-baklava-tray-large", price: 290 },
        { optionItemId: "opt-baklava-rose", price: 18 },
        { optionItemId: "opt-baklava-gold", price: 45 },
        { optionItemId: "opt-kunafa-6", price: 190 },
        { optionItemId: "opt-kunafa-12", price: 370 },
        { optionItemId: "opt-sourdough-classic", price: 28 },
        { optionItemId: "opt-sourdough-dukkah", price: 34 },
        { optionItemId: "opt-quiche-12", price: 216 },
        { optionItemId: "opt-quiche-24", price: 396 },
        { optionItemId: "opt-babka-caramel", price: 12 },
        { optionItemId: "opt-babka-praline", price: 18 },
        { optionItemId: "opt-babka-finish", price: 0 },
        { optionItemId: "opt-pistachio-2kg", price: 240 },
        { optionItemId: "opt-pistachio-5kg", price: 400 },
    ];

    return entries.map((entry, index) => {
        const option = products
            .flatMap((product) => product.optionGroups)
            .flatMap((group) => group.items.map((item) => ({ group, item })))
            .find(({ item }) => item.id === entry.optionItemId);

        return {
            id: `${listId}-price-${index}`,
            optionItemId: entry.optionItemId,
            priceListId: listId,
            price: entry.price,
            multiplier:
                typeof option?.item.multiplier === "string"
                    ? Number(option!.item.multiplier)
                    : option?.item.multiplier ?? null,
            optionItem: option
                ? {
                      id: option.item.id,
                      name: option.item.name,
                      optionGroup: {
                          id: option.group.id,
                          name: option.group.name,
                          product: {
                              id: products.find((p) =>
                                  p.optionGroups
                                      .map((g) => g.id)
                                      .includes(option.group.id)
                              )?.id,
                              name:
                                  products.find((p) =>
                                      p.optionGroups
                                          .map((g) => g.id)
                                          .includes(option.group.id)
                                  )?.name ?? "",
                          },
                      },
                  }
                : undefined,
        };
    });
};

const priceLists = [
    {
        id: "pl-retail-standard",
        name: "Standard Retail",
        isDefault: true,
        type: "RETAIL",
        distributorId: null,
        createdAt: isoDaysAgo(20),
        updatedAt: todayIso,
        prices: priceListItems("pl-retail-standard"),
    },
    {
        id: "pl-wholesale-gulf",
        name: "Gulf Wholesale",
        isDefault: false,
        type: "WHOLESALE",
        distributorId: "user-distributor-nadia",
        createdAt: isoDaysAgo(35),
        updatedAt: isoDaysAgo(1),
        prices: priceListItems("pl-wholesale-gulf").map((price) => ({
            ...price,
            price: Math.round((price.price || 0) * 0.82),
        })),
    },
];

const orderUser = (userId: string) => {
    const base = users.find((u) => u.id === userId);
    if (!base) {
        throw new Error(`Missing user ${userId}`);
    }
    const { password: _unusedPassword, ...user } = base;
    void _unusedPassword;
    return user;
};

export const createOrder = (
    id: string,
    payload: {
        number: number;
        clientId: string;
        createdAt: string;
        status: Order["deliveryStatus"];
        productionStatus: Order["productionStatus"];
        deliveredBy?: string | null;
        deliveredAt?: string | null;
        items: Array<{
            id: string;
            productId: string;
            quantity: number;
            selectionIds: string[];
            productionStatus: OrderItem["productionStatus"];
            producedQuantity?: number;
            deliveredQuantity?: number;
            unitPrice: number;
            totalPrice: number;
        }>;
        notes?: string | null;
        deliveryNotes?: string | null;
    }
): Order => {
    const orderItems: Order["items"] = payload.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const selectedOptions = item.selectionIds.map((optionId) => ({
            optionItem: {
                id: optionId,
                name:
                    products
                        .flatMap((p) => p.optionGroups)
                        .flatMap((g) => g.items)
                        .find((opt) => opt.id === optionId)?.name ?? optionId,
            },
        }));
        return {
            id: item.id,
            quantity: item.quantity,
            productionStatus: item.productionStatus,
            producedQuantity: item.producedQuantity,
            deliveredQuantity: item.deliveredQuantity,
            productionNotes: null,
            deliveryStatus:
                payload.status === "READY_FOR_DELIVERY"
                    ? "READY_FOR_DELIVERY"
                    : payload.status === "DELIVERED"
                    ? "DELIVERED"
                    : payload.status === "FAILED"
                    ? "FAILED"
                    : payload.status === "PARTIALLY_DELIVERED"
                    ? "PARTIAL"
                    : "PENDING",
            deliveryNotes: payload.deliveryNotes ?? null,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            retailUnitPrice: item.unitPrice,
            retailTotalPrice: item.totalPrice,
            product: product
                ? {
                      id: product.id,
                      name: product.name,
                      unit: product.unit,
                      productGroup: product.productGroup,
                  }
                : null,
            selectedOptions,
        };
    });

    const totals = orderItems.reduce(
        (acc, item) => {
            const total = item.retailTotalPrice ?? 0;
            acc.initial += total;
            acc.final += total;
            return acc;
        },
        { initial: 0, final: 0 }
    );

    return {
        id,
        orderNumber: payload.number,
        createdAt: payload.createdAt,
        notes: payload.notes ?? null,
        deliveryNotes: payload.deliveryNotes ?? null,
        productionStatus: payload.productionStatus,
        deliveryStatus: payload.status,
        user: orderUser(payload.clientId),
        items: orderItems,
        finalRetailTotalAmount: totals.final,
        initialRetailTotalAmount: totals.initial,
        finalTotalAmount: totals.final,
        initialTotalAmount: totals.initial,
        currency: "AED",
        deliveredByUserId: payload.deliveredBy ?? null,
        deliveredByUser: payload.deliveredBy
            ? {
                  name: orderUser(payload.deliveredBy).name,
                  surname: orderUser(payload.deliveredBy).surname,
              }
            : null,
        deliveredAt: payload.deliveredAt ?? null,
        attachmentUrl: null,
    };
};

const orders: Order[] = [
    createOrder("ord-1001", {
        number: 1001,
        clientId: "user-client-lina",
        createdAt: isoDaysAgo(0),
        status: "READY_FOR_DELIVERY",
        productionStatus: "PENDING",
        items: [
            {
                id: "ord-1001-item-1",
                productId: "prod-baklava",
                quantity: 3,
                selectionIds: ["opt-baklava-tray-medium", "opt-baklava-rose"],
                productionStatus: "PENDING",
                unitPrice: 253,
                totalPrice: 759,
            },
            {
                id: "ord-1001-item-2",
                productId: "prod-kunefe",
                quantity: 2,
                selectionIds: ["opt-kunafa-12"],
                productionStatus: "PENDING",
                unitPrice: 370,
                totalPrice: 740,
            },
        ],
        notes: "Display trays for VIP tasting, add gold finish.",
    }),
];

orders.push(
    createOrder("ord-1002", {
        number: 1002,
        clientId: "user-client-omar",
        createdAt: isoDaysAgo(1),
        status: "READY_FOR_DELIVERY",
        productionStatus: "PARTIALLY_COMPLETED",
        items: [
            {
                id: "ord-1002-item-1",
                productId: "prod-sourdough",
                quantity: 40,
                selectionIds: ["opt-sourdough-classic"],
                productionStatus: "COMPLETED",
                producedQuantity: 40,
                unitPrice: 28,
                totalPrice: 1120,
            },
            {
                id: "ord-1002-item-2",
                productId: "prod-mini-quiche",
                quantity: 5,
                selectionIds: ["opt-quiche-24"],
                productionStatus: "PENDING",
                producedQuantity: 0,
                unitPrice: 396,
                totalPrice: 1980,
            },
        ],
        notes: "Brunch launch - box each loaf separately.",
    })
);

orders.push(
    createOrder("ord-1003", {
        number: 1003,
        clientId: "user-client-lina",
        createdAt: isoDaysAgo(3),
        status: "DELIVERED",
        productionStatus: "COMPLETED",
        deliveredBy: "user-driver-yusuf",
        deliveredAt: isoDaysAgo(2),
        items: [
            {
                id: "ord-1003-item-1",
                productId: "prod-baklava",
                quantity: 2,
                selectionIds: ["opt-baklava-tray-large", "opt-baklava-gold"],
                productionStatus: "COMPLETED",
                deliveredQuantity: 2,
                unitPrice: 335,
                totalPrice: 670,
            },
            {
                id: "ord-1003-item-2",
                productId: "prod-pistachio-latte",
                quantity: 1,
                selectionIds: ["opt-pistachio-5kg"],
                productionStatus: "COMPLETED",
                deliveredQuantity: 1,
                unitPrice: 400,
                totalPrice: 400,
            },
        ],
        notes: "Bar prep for weekend.",
    })
);

orders.push(
    createOrder("ord-1004", {
        number: 1004,
        clientId: "user-client-omar",
        createdAt: isoDaysAgo(4),
        status: "PARTIALLY_DELIVERED",
        productionStatus: "COMPLETED",
        deliveredBy: "user-driver-yusuf",
        deliveredAt: isoDaysAgo(3),
        items: [
            {
                id: "ord-1004-item-1",
                productId: "prod-mini-quiche",
                quantity: 8,
                selectionIds: ["opt-quiche-24"],
                productionStatus: "COMPLETED",
                deliveredQuantity: 6,
                unitPrice: 396,
                totalPrice: 3168,
                productionNotes: "2 trays held for QC",
            },
        ],
        deliveryNotes: "Partial handover, client accepted with note.",
    })
);

orders.push(
    createOrder("ord-1005", {
        number: 1005,
        clientId: "user-client-lina",
        createdAt: isoDaysAgo(5),
        status: "FAILED",
        productionStatus: "COMPLETED",
        deliveredBy: "user-driver-yusuf",
        deliveredAt: isoDaysAgo(4),
        items: [
            {
                id: "ord-1005-item-1",
                productId: "prod-sourdough",
                quantity: 30,
                selectionIds: ["opt-sourdough-dukkah"],
                productionStatus: "COMPLETED",
                deliveredQuantity: 0,
                unitPrice: 34,
                totalPrice: 1020,
                productionNotes: "Driver reported refrigeration issue",
            },
        ],
        deliveryNotes: "Client postponed due to store issue.",
    })
);

const favorites: Record<string, string[]> = {
    "user-client-lina": ["prod-baklava", "prod-pistachio-latte"],
    "user-client-omar": ["prod-sourdough", "prod-mini-quiche"],
};

export const createDemoState = (): DemoState => {
    const activeClients = users.filter(
        (user) => user.role === "CLIENT" && user.isActive
    );
    const inactiveClients = users.filter(
        (user) => user.role === "CLIENT" && !user.isActive
    );

    return {
        users,
        categories,
        products,
        priceLists,
        orders,
        favorites,
        carts: {
            "user-client-lina": [],
            "user-client-omar": [],
        },
        customersAnalytics: {
            summary: {
                totalCustomers: activeClients.length + inactiveClients.length,
                activeCustomers: activeClients.length,
                inactiveCustomers: inactiveClients.length,
            },
        },
        metadata: {
            lastUpdated: `${DEMO_DATA_VERSION}:${todayIso}`,
        },
    };
};
