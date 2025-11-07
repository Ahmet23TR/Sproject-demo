"use client";
import React, { useState, useEffect } from "react";
import { TableRow, TableCell, TextField } from "@mui/material";
import { PriceListItem } from "@/types/data";

interface PriceListRowProps {
    item: PriceListItem;
    edit: { price?: number; multiplier?: number };
    onEditChange: (
        optionItemId: string,
        field: "price" | "multiplier",
        value: number | undefined
    ) => void;
}

export const PriceListRow = React.memo(
    ({ item, edit, onEditChange }: PriceListRowProps) => {
        // Her input için kendi yerel, string tabanlı state'i
        const [localPrice, setLocalPrice] = useState<string>(
            (edit?.price ?? item.price)?.toString() ?? ""
        );
        const [localMultiplier, setLocalMultiplier] = useState<string>(
            (edit?.multiplier ?? item.multiplier)?.toString() ?? ""
        );

        // Dışarıdan gelen veri değişirse, input'ları güncelle
        useEffect(() => {
            setLocalPrice((edit?.price ?? item.price)?.toString() ?? "");
            setLocalMultiplier(
                (edit?.multiplier ?? item.multiplier)?.toString() ?? ""
            );
        }, [item, edit]);

        const handleBlur = (field: "price" | "multiplier", value: string) => {
            const num = parseFloat(value.replace(",", "."));
            const finalValue = isNaN(num) ? undefined : num;
            onEditChange(item.optionItemId, field, finalValue);
        };

        return (
            <TableRow
                hover
                sx={{
                    "&:hover": {
                        backgroundColor: "rgba(248, 250, 252, 0.8)",
                    },
                    borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                }}>
                <TableCell>
                    {item.optionItem?.optionGroup?.product?.name || "-"}
                </TableCell>
                <TableCell>
                    {item.optionItem?.name || item.optionItemId}
                </TableCell>
                <TableCell>AED</TableCell>
                <TableCell>
                    {item.optionItem?.defaultPrice
                        ? item.optionItem?.defaultPrice
                        : item.multiplier
                        ? item.multiplier
                        : "-"}
                </TableCell>
                <TableCell>
                    <TextField
                        size="small"
                        type="text"
                        inputMode="decimal"
                        value={localPrice}
                        onChange={(e) => setLocalPrice(e.target.value)}
                        onBlur={(e) => handleBlur("price", e.target.value)}
                        placeholder={!localPrice ? "0.00" : ""}
                        disabled={!!item.multiplier}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 1.5,
                                fontSize: "0.875rem",
                                "&:hover": {
                                    borderColor: "primary.main",
                                },
                                "&.Mui-focused": {
                                    borderColor: "primary.main",
                                },
                                "&.Mui-disabled": {
                                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                                },
                            },
                            minWidth: 120,
                        }}
                    />
                </TableCell>
                <TableCell>
                    <TextField
                        size="small"
                        type="text"
                        inputMode="decimal"
                        value={localMultiplier}
                        onChange={(e) => setLocalMultiplier(e.target.value)}
                        onBlur={(e) => handleBlur("multiplier", e.target.value)}
                        placeholder={!localMultiplier ? "1.0" : ""}
                        disabled={!!item.optionItem?.defaultPrice}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 1.5,
                                fontSize: "0.875rem",
                                "&:hover": {
                                    borderColor: "primary.main",
                                },
                                "&.Mui-focused": {
                                    borderColor: "primary.main",
                                },
                                "&.Mui-disabled": {
                                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                                },
                            },
                            minWidth: 120,
                        }}
                    />
                </TableCell>
            </TableRow>
        );
    }
);

PriceListRow.displayName = "PriceListRow";
