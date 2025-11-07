"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { calculateProductPrice } from "../../utils/price";
import type { Product, OptionGroup } from "../../services/productService";

// Seçilen opsiyonların state'i için tip tanımı: { groupId: [itemId1, itemId2] }
type SelectedOptionsState = Record<string, string[]>;

export const useProductConfigurator = (
    product: Product | null,
    onClose: () => void
) => {
    const { addToCart } = useCart();
    const [selectedOptions, setSelectedOptions] =
        useState<SelectedOptionsState>({});
    const [error, setError] = useState<string | null>(null);

    // Modal her açıldığında veya ürün değiştiğinde state'i sıfırla ve tek seçenekli grupları otomatik seç
    useEffect(() => {
        if (!product?.optionGroups) {
            setSelectedOptions({});
            setError(null);
            return;
        }

        // Tek seçenekli grupları otomatik seç
        const autoSelectedOptions: SelectedOptionsState = {};

        product.optionGroups.forEach((group) => {
            // Eğer grup tek seçenekli ve tek item'i varsa otomatik seç
            if (!group.allowMultiple && group.items.length === 1) {
                autoSelectedOptions[group.id] = [group.items[0].id];
            }
        });

        setSelectedOptions(autoSelectedOptions);
        setError(null);
    }, [product, onClose]);

    // Fiyat hesaplama fonksiyonu - useMemo kullanarak gereksiz hesaplamaları önle
    const calculatePrice = useMemo(() => {
        if (!product) return 0;

        // Eğer ürünün opsiyon grupları yoksa, 0 döndür
        if (!product.optionGroups || product.optionGroups.length === 0) {
            return 0;
        }

        // selectedOptions'ı group name bazlı hale getir
        const groupNameSelected: { [groupName: string]: string | string[] } =
            {};

        product.optionGroups.forEach((group) => {
            const selectedIds = selectedOptions[group.id] || [];
            if (selectedIds.length > 0) {
                // OptionGroup'un items'ından seçilenlerin name'ini bul
                const selectedNames = selectedIds
                    .map(
                        (id) => group.items.find((item) => item.id === id)?.name
                    )
                    .filter(Boolean) as string[];

                if (selectedNames.length > 0) {
                    groupNameSelected[group.name] = group.allowMultiple
                        ? selectedNames
                        : selectedNames[0];
                }
            }
        });

        return calculateProductPrice(product, groupNameSelected);
    }, [product, selectedOptions]);

    const handleOptionChange = useCallback(
        (group: OptionGroup, itemId: string, isChecked: boolean) => {
            setSelectedOptions((prev) => {
                const currentSelection = prev[group.id] || [];
                if (group.allowMultiple) {
                    // Checkbox mantığı (çoklu seçim)
                    return {
                        ...prev,
                        [group.id]: isChecked
                            ? [...currentSelection, itemId]
                            : currentSelection.filter((id) => id !== itemId),
                    };
                } else {
                    // Radio button mantığı (tek seçim)
                    return { ...prev, [group.id]: [itemId] };
                }
            });
        },
        []
    );

    const handleAddToCart = useCallback(async () => {
        if (!product) return;

        // Eğer ürünün opsiyon grupları yoksa, direkt sepete ekle
        if (!product.optionGroups || product.optionGroups.length === 0) {
            const cartItem = {
                productId: product.id,
                quantity: 1,
                selectedOptionItemIds: [],
            };

            try {
                await addToCart(cartItem, (addedItem) => {
                    const windowWithCallback = window as typeof window & {
                        __cartItemAddedCallback?: (
                            item: typeof addedItem
                        ) => void;
                    };
                    if (windowWithCallback.__cartItemAddedCallback) {
                        windowWithCallback.__cartItemAddedCallback(addedItem);
                    }
                });

                onClose();
                return;
            } catch (error) {
                console.error("Error adding to cart:", error);
                setError("Failed to add item to cart. Please try again.");
                return;
            }
        }

        // Validasyon: Zorunlu gruplar seçilmiş mi?
        for (const group of product.optionGroups || []) {
            if (
                group.isRequired &&
                (!selectedOptions[group.id] ||
                    selectedOptions[group.id].length === 0)
            ) {
                setError(`Please select an option for "${group.name}".`);
                return;
            }
        }

        setError(null);

        // Tüm seçilen ID'leri tek bir diziye topla
        const selectedOptionItemIds = Object.values(selectedOptions).flat();

        const cartItem = {
            productId: product.id,
            quantity: 1,
            selectedOptionItemIds,
        };

        try {
            // Sepete ekle
            await addToCart(cartItem, (addedItem) => {
                // Yeni ürün eklendikten sonra focus vermek için callback'i çağır
                const windowWithCallback = window as typeof window & {
                    __cartItemAddedCallback?: (item: typeof addedItem) => void;
                };
                if (windowWithCallback.__cartItemAddedCallback) {
                    windowWithCallback.__cartItemAddedCallback(addedItem);
                }
            });

            onClose(); // İşlem başarılı, modal'ı kapat
        } catch (error) {
            console.error("Error adding to cart:", error);
            setError("Failed to add item to cart. Please try again.");
        }
    }, [product, selectedOptions, addToCart, onClose]);

    return {
        selectedOptions,
        error,
        handleOptionChange,
        handleAddToCart,
        calculatePrice,
    };
};
