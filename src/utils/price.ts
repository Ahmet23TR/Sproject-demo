// Backend API'den gelen ürün yapısı için tip tanımları - productService tipleriyle uyumlu
import type { Product } from "../services/productService";
import type { Order, OrderItem } from "../types/data";

// Kullanıcı seçimleri: { [optionGroupName]: string | string[] }
type SelectedOptions = {
    [optionGroupName: string]: string | string[];
};

/**
 * Backend API'den gelen ürün için fiyat hesaplama
 * SWEETS: Filling fiyatı + Tepsi multiplier (Big=2x, Small=1x)
 * BAKERY: Weight fiyatı (Filling=0)
 */
export function calculateProductPrice(
    product: Product,
    selectedOptions: SelectedOptions
): number {
    if (product.productGroup === "SWEETS") {
        return calculateSweetsPrice(product, selectedOptions);
    } else if (product.productGroup === "BAKERY") {
        return calculateBakeryPrice(product, selectedOptions);
    }

    return 0;
}

function calculateSweetsPrice(
    product: Product,
    selectedOptions: SelectedOptions
): number {
    let basePrice = product.basePrice || 0; // Ürünün base price'ını başlangıç olarak al
    let multiplier = 1;

    product.optionGroups.forEach((group) => {
        const selected = selectedOptions[group.name];
        if (!selected) return;

        const selectedNames = Array.isArray(selected) ? selected : [selected];

        selectedNames.forEach((name) => {
            const item = group.items.find((i) => i.name === name);
            if (!item) return;

            // Önce multiplier kontrolü yap
            if (item.multiplier !== undefined) {
                const itemMultiplier =
                    typeof item.multiplier === "string"
                        ? parseFloat(item.multiplier)
                        : item.multiplier;

                // Eğer multiplier 1'den büyükse, bu bir çarpan grubu
                if (itemMultiplier > 1) {
                    if (itemMultiplier > multiplier) {
                        multiplier = itemMultiplier;
                    }
                } else {
                    // Multiplier 1 ise, bu bir fiyat grubu
                    const itemPrice = item.price || 0;
                    basePrice += itemPrice;
                }
            } else {
                // Multiplier yoksa, fiyat grubu olarak kabul et
                const itemPrice = item.price || 0;
                basePrice += itemPrice;
            }
        });
    });

    const finalPrice = basePrice * multiplier;
    return finalPrice;
}

function calculateBakeryPrice(
    product: Product,
    selectedOptions: SelectedOptions
): number {
    let totalPrice = product.basePrice || 0; // Ürünün base price'ını başlangıç olarak al

    product.optionGroups.forEach((group) => {
        const selected = selectedOptions[group.name];
        if (!selected) return;

        const selectedNames = Array.isArray(selected) ? selected : [selected];

        selectedNames.forEach((name) => {
            const item = group.items.find((i) => i.name === name);
            if (!item) return;

            // BAKERY ürünleri için fiyat hesaplama mantığı:
            // - Filling grubu hariç tüm grupların fiyatları eklenir
            // - Filling grubu: fiyat eklenmez (genelde 0)
            if (group.name !== "Filling") {
                const itemPrice = item.price || 0;
                totalPrice += itemPrice;
            } else {
            }
        });
    });

    return totalPrice;
}

/**
 * Calculate final total amount based on delivered quantities
 * If any items have partial delivery, calculate the actual delivered value
 */
export function calculateFinalTotalAmount(order: Order): number {
    return order.items.reduce((sum: number, item) => {
        const { unitPrice } = calculateOrderItemPrices(item);
        const deliveredQty = item.deliveredQuantity ?? item.quantity ?? 0;
        return sum + unitPrice * deliveredQty;
    }, 0);
}

/**
 * Calculate order item prices when they are missing from backend response
 * This is a fallback solution until backend is fixed
 */
export function calculateOrderItemPrices(orderItem: OrderItem): {
    unitPrice: number;
    totalPrice: number;
} {
    // If backend already provided prices, use them
    if (
        orderItem.unitPrice !== undefined &&
        orderItem.totalPrice !== undefined
    ) {
        return {
            unitPrice: orderItem.unitPrice,
            totalPrice: orderItem.totalPrice,
        };
    }

    // Fallback calculation using selected options
    let basePrice = 0;
    let multiplier = 1;

    // Calculate from selected options if available
    if (orderItem.selectedOptions && orderItem.selectedOptions.length > 0) {
        orderItem.selectedOptions.forEach((option) => {
            const optionItem = option.optionItem;
            if (!optionItem) {
                return;
            }
            const { multiplier: optionMultiplierRaw, price: optionPriceRaw } = optionItem;

            if (optionMultiplierRaw !== undefined) {
                const optionMultiplier =
                    typeof optionMultiplierRaw === "string"
                        ? parseFloat(optionMultiplierRaw)
                        : optionMultiplierRaw;

                if (optionMultiplier > multiplier) {
                    multiplier = optionMultiplier;
                }
            } else if (optionPriceRaw !== undefined) {
                const optionPrice =
                    typeof optionPriceRaw === "string"
                        ? parseFloat(optionPriceRaw)
                        : optionPriceRaw;
                basePrice += optionPrice;
            }
        });
    }

    const unitPrice = basePrice * multiplier;
    const totalPrice = unitPrice * orderItem.quantity;

    return { unitPrice, totalPrice };
}

/**
 * Para miktarını TL cinsinden formatlar
 * @param amount - Formatlanacak miktar (number)
 * @param currency - Para birimi (varsayılan: '₺')
 * @returns Formatlanmış para miktarı
 */
export function formatCurrency(
    amount: number,
    currency: string = "AED"
): string {
    if (amount === 0) return `0 ${currency}`;
    if (isNaN(amount)) return `-`;

    return (
        new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount) + ` ${currency}`
    );
}
