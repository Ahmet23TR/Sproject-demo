import React, { useMemo } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableFooter,
    TableBody,
    Chip,
    Box,
    Divider,
} from "@mui/material";
import { LoadingButton } from "../../../../components/ui/LoadingButton";
import { InlineBusy } from "../../../../components/ui/InlineBusy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Order, ProductGroup } from "../../../../types/data";

interface OrderAccordionProps {
    order: Order;
    isExpanded: boolean;
    onToggle: () => void;
    onComplete: (itemId: string) => void;
    onCancel: (item: Order["items"][0]) => void;
    onPartial: (item: Order["items"][0]) => void;
    updatingItemId: string | null;
    detailsMaxHeight?: number;
    chefProductGroup?: ProductGroup | null;
}

export const OrderAccordion = ({
    order,
    isExpanded,
    onToggle,
    onComplete,
    onCancel,
    onPartial,
    updatingItemId,
    detailsMaxHeight,
    chefProductGroup,
}: OrderAccordionProps) => {
    // Filtrelenmiş item'lar - sadece şefin ürün grubuna ait olanlar
    const filteredItems = useMemo(() => {
        if (!chefProductGroup) {
            return order.items;
        }

        return order.items.filter(
            (item) =>
                item.product && item.product.productGroup === chefProductGroup
        );
    }, [order.items, chefProductGroup]);

    // Eğer filtrelenmiş item yoksa, bu siparişi gösterme
    if (filteredItems.length === 0) {
        return null;
    }

    const completedCount = filteredItems.filter((item) => {
        const status = (item.productionStatus || "PENDING").toUpperCase();
        return (
            status === "COMPLETED" ||
            status === "PARTIAL" ||
            status === "PARTIALLY_COMPLETED" ||
            status === "CANCELLED"
        );
    }).length;

    const getStatusChip = (
        status:
            | "PENDING"
            | "PARTIAL"
            | "PARTIALLY_COMPLETED"
            | "COMPLETED"
            | "CANCELLED"
            | "FAILED"
    ) => {
        switch (status) {
            case "COMPLETED":
                return (
                    <Chip
                        label="Completed"
                        color="success"
                        size="small"
                        variant="outlined"
                    />
                );
            case "PARTIAL":
            case "PARTIALLY_COMPLETED":
                return (
                    <Chip
                        label="Partially Completed"
                        color="warning"
                        size="small"
                        variant="outlined"
                    />
                );
            case "FAILED":
                return (
                    <Chip
                        label="Delivery Failed"
                        color="error"
                        size="small"
                        variant="outlined"
                    />
                );
            case "CANCELLED":
                return (
                    <Chip
                        label="Cancelled"
                        color="error"
                        size="small"
                        variant="outlined"
                    />
                );
            default:
                return <Chip label="Pending" color="warning" size="small" />;
        }
    };

    const isOrderCancelled = filteredItems.every(
        (item) => (item.productionStatus || "PENDING") === "CANCELLED"
    );

    return (
        <Accordion
            expanded={isExpanded}
            onChange={onToggle}
            sx={{ mb: 1, boxShadow: 1, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                    sx={{
                        flexShrink: 0,
                        width: { xs: "50%", md: "40%" },
                        fontSize: "14px",
                        fontWeight: 600,
                    }}>
                    <b>Order:</b> {order.orderNumber}
                </Typography>
                {isOrderCancelled ? (
                    <Chip
                        label="CANCELLED"
                        color="error"
                        size="small"
                        sx={{
                            ml: 2,
                            fontSize: "12px",
                            fontWeight: 700,
                            px: 1.5,
                        }}
                    />
                ) : (
                    <Typography
                        color="text.secondary"
                        sx={{ fontSize: "12px" }}>
                        ({completedCount}/{filteredItems.length} marked)
                    </Typography>
                )}
            </AccordionSummary>
            <AccordionDetails
                sx={
                    detailsMaxHeight
                        ? { maxHeight: detailsMaxHeight, overflow: "auto" }
                        : {}
                }>
                {/* Mobile-friendly cards (xs only) */}
                <Box sx={{ display: { xs: "block", sm: "none" } }}>
                    {filteredItems.map((item) => {
                        const isPending =
                            (item.productionStatus || "PENDING") === "PENDING";
                        const isBeingUpdated = updatingItemId === item.id;
                        const produced = item.producedQuantity ?? 0;
                        const status = (item.productionStatus || "PENDING") as
                            | "PENDING"
                            | "PARTIAL"
                            | "PARTIALLY_COMPLETED"
                            | "COMPLETED"
                            | "CANCELLED"
                            | "FAILED";

                        return (
                            <Box
                                key={item.id}
                                sx={{
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    px: 1.5,
                                    py: 1.25,
                                    mb: 1.25,
                                    bgcolor: "background.paper",
                                }}>
                                {/* Header: Product name + options */}
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "14px",
                                            lineHeight: 1.25,
                                        }}>
                                        {item.product?.name}
                                    </Typography>
                                    {item.selectedOptions &&
                                        item.selectedOptions.length > 0 && (
                                            <Typography
                                                sx={{
                                                    fontSize: "12px",
                                                    color: "text.secondary",
                                                    fontStyle: "italic",
                                                }}>
                                                {item.selectedOptions
                                                    ?.map(
                                                        (o) => o.optionItem.name
                                                    )
                                                    .join(", ")}
                                            </Typography>
                                        )}
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                {/* Middle: Quantity + unit on left, status chip on right */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                    }}>
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: "16px",
                                            }}>
                                            {produced} / {item.quantity}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "11px",
                                                color: "text.secondary",
                                            }}>
                                            {item.product?.unit}
                                        </Typography>
                                    </Box>
                                    <Box>{getStatusChip(status)}</Box>
                                </Box>

                                {/* Processed by info and partial reason (when applicable) */}
                                {(status === "COMPLETED" ||
                                    status === "CANCELLED" ||
                                    status === "PARTIALLY_COMPLETED") &&
                                    item.processedByUser && (
                                        <Typography
                                            sx={{
                                                fontSize: "11px",
                                                color: "text.secondary",
                                                mt: 0.5,
                                            }}>
                                            Chef: {item.processedByUser.name}{" "}
                                            {item.processedByUser.surname}
                                        </Typography>
                                    )}
                                {status === "PARTIALLY_COMPLETED" &&
                                    item.productionNotes && (
                                        <Typography
                                            sx={{
                                                fontSize: "11px",
                                                color: "text.secondary",
                                                mt: 0.25,
                                            }}>
                                            Reason: &lsquo;{item.productionNotes}&rsquo;
                                        </Typography>
                                    )}
                                {/* Actions: three small buttons in one row */}
                                {!isOrderCancelled && isPending && (
                                    <Box sx={{ mt: 1 }}>
                                        <InlineBusy loading={isBeingUpdated}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: 0.75,
                                                    alignItems: "center",
                                                }}>
                                                <LoadingButton
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() =>
                                                        onComplete(item.id)
                                                    }
                                                    loading={isBeingUpdated}
                                                    sx={{
                                                        flex: 1,
                                                        height: 34,
                                                        minWidth: 0,
                                                        textTransform: "none",
                                                        fontSize: "12px",
                                                        px: 1,
                                                    }}>
                                                    Completed
                                                </LoadingButton>
                                                <LoadingButton
                                                    size="small"
                                                    variant="outlined"
                                                    color="warning"
                                                    onClick={() =>
                                                        onPartial(item)
                                                    }
                                                    loading={isBeingUpdated}
                                                    sx={{
                                                        color: "white",
                                                        bgcolor: "warning.main",
                                                        flex: 1,
                                                        height: 34,
                                                        minWidth: 0,
                                                        textTransform: "none",
                                                        fontSize: "12px",
                                                        px: 1,
                                                    }}>
                                                    Partial
                                                </LoadingButton>
                                                <LoadingButton
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() =>
                                                        onCancel(item)
                                                    }
                                                    loading={isBeingUpdated}
                                                    sx={{
                                                        flex: 1,
                                                        height: 34,
                                                        bgcolor: "error.main",
                                                        color: "white",
                                                        minWidth: 0,
                                                        textTransform: "none",
                                                        fontSize: "12px",
                                                        px: 1,
                                                    }}>
                                                    Failed
                                                </LoadingButton>
                                            </Box>
                                        </InlineBusy>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                    {/* Order notes for mobile */}
                    <Box sx={{ mt: 1 }}>
                        <Typography sx={{ fontSize: "12px" }}>
                            <b>Notes:</b> {order.notes || "---"}
                        </Typography>
                    </Box>
                </Box>

                {/* Existing table view retained for sm+ screens */}
                <TableContainer sx={{ display: { xs: "none", sm: "block" } }}>
                    <Table
                        size="small"
                        sx={{
                            "& .MuiTableCell-root": {
                                fontSize: "13px",
                                py: 0.75,
                            },
                            "& thead .MuiTableCell-root": {
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#111827",
                                bgcolor: "rgba(0,0,0,0.02)",
                                borderBottom: "1px solid rgba(0,0,0,0.08)",
                            },
                            // subtle vertical separators
                            "& th:not(:last-of-type), & td:not(:last-of-type)":
                                {
                                    borderRight: "1px solid rgba(0,0,0,0.04)",
                                },
                            // subtle row separators
                            "& tbody .MuiTableCell-root": {
                                borderBottom: "1px solid rgba(0,0,0,0.06)",
                            },
                            "& tbody .MuiTableRow-root:last-of-type .MuiTableCell-root":
                                {
                                    borderBottom: 0,
                                },
                        }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell align="center">Quantity</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredItems.map((item) => {
                                const isPending =
                                    (item.productionStatus || "PENDING") ===
                                    "PENDING";
                                const isBeingUpdated =
                                    updatingItemId === item.id;
                                const produced = item.producedQuantity ?? 0;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Typography
                                                component="span"
                                                fontWeight={600}
                                                sx={{
                                                    fontSize: "13px",
                                                    lineHeight: 1.3,
                                                }}>
                                                {item.product?.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                display="block"
                                                color="text.secondary"
                                                sx={{ fontSize: "12px" }}>
                                                {item.selectedOptions
                                                    ?.map(
                                                        (o) => o.optionItem.name
                                                    )
                                                    .join(", ")}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: "12px" }}>
                                                {produced} / {item.quantity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(
                                                (item.productionStatus ||
                                                    "PENDING") as
                                                    | "PENDING"
                                                    | "PARTIAL"
                                                    | "PARTIALLY_COMPLETED"
                                                    | "COMPLETED"
                                                    | "CANCELLED"
                                                    | "FAILED"
                                            )}
                                            {((item.productionStatus ||
                                                "PENDING") === "COMPLETED" ||
                                                (item.productionStatus ||
                                                    "PENDING") ===
                                                    "CANCELLED" ||
                                                (item.productionStatus ||
                                                    "PENDING") ===
                                                    "PARTIALLY_COMPLETED" ||
                                                (item.productionStatus ||
                                                    "PENDING") ===
                                                    "PARTIALLY_COMPLETED") &&
                                                item.processedByUser && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            ml: 1,
                                                            fontSize: "11px",
                                                        }}>
                                                        - (Chef:{" "}
                                                        {
                                                            item.processedByUser
                                                                .name
                                                        }{" "}
                                                        {
                                                            item.processedByUser
                                                                .surname
                                                        }
                                                        )
                                                    </Typography>
                                                )}
                                            {item.productionStatus ===
                                                "PARTIALLY_COMPLETED" &&
                                                item.productionNotes && (
                                                    <Typography
                                                        variant="caption"
                                                        display="block"
                                                        sx={{
                                                            fontSize: "11px",
                                                        }}>
                                                        Reason: &quot;
                                                        {item.productionNotes}
                                                        &quot;
                                                    </Typography>
                                                )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {!isOrderCancelled && isPending && (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        gap: 1,
                                                        justifyContent:
                                                            "flex-end",
                                                    }}>
                                                    <InlineBusy
                                                        loading={
                                                            isBeingUpdated
                                                        }>
                                                        <Box
                                                            display="flex"
                                                            gap={0.5}>
                                                            <LoadingButton
                                                                size="small"
                                                                variant="contained"
                                                                onClick={() =>
                                                                    onPartial(
                                                                        item
                                                                    )
                                                                }
                                                                loading={
                                                                    isBeingUpdated
                                                                }
                                                                sx={{
                                                                    bgcolor:
                                                                        "#F59E0B",
                                                                    color: "#fff",
                                                                    "&:hover": {
                                                                        bgcolor:
                                                                            "#d97706",
                                                                    },
                                                                    fontSize:
                                                                        "0.62rem",
                                                                    py: 0.2,
                                                                    px: 1,
                                                                    minWidth: 0,
                                                                    height: 30,
                                                                }}>
                                                                Partial
                                                            </LoadingButton>
                                                            <LoadingButton
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() =>
                                                                    onComplete(
                                                                        item.id
                                                                    )
                                                                }
                                                                loading={
                                                                    isBeingUpdated
                                                                }
                                                                sx={{
                                                                    fontSize:
                                                                        "0.62rem",
                                                                    py: 0.2,
                                                                    px: 1,
                                                                    minWidth: 0,
                                                                    height: 30,
                                                                }}>
                                                                Completed
                                                            </LoadingButton>
                                                            <LoadingButton
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                onClick={() =>
                                                                    onCancel(
                                                                        item
                                                                    )
                                                                }
                                                                loading={
                                                                    isBeingUpdated
                                                                }
                                                                sx={{
                                                                    fontSize:
                                                                        "0.62rem",
                                                                    py: 0.2,
                                                                    px: 1,
                                                                    minWidth: 0,
                                                                    height: 30,
                                                                    bgcolor:
                                                                        "error.main",
                                                                    color: "white",
                                                                    ":hover": {
                                                                        bgcolor:
                                                                            "error.dark",
                                                                        borderColor:
                                                                            "error.dark",
                                                                    },
                                                                }}>
                                                                Failed
                                                            </LoadingButton>
                                                        </Box>
                                                    </InlineBusy>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    align="left"
                                    sx={{
                                        borderTop: 1,
                                        borderColor: "divider",
                                        pt: 2,
                                    }}>
                                    <Typography sx={{ fontSize: "12px" }}>
                                        <b>Notes:</b> {order.notes || "---"}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </AccordionDetails>
        </Accordion>
    );
};
