import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    Divider,
    useMediaQuery,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { GroupedProductionList } from "./ProductionSummary";

interface ProductionDetailsModalProps {
    open: boolean;
    onClose: () => void;
    groupedList: GroupedProductionList;
}

export const ProductionDetailsModal = ({
    open,
    onClose,
    groupedList,
}: ProductionDetailsModalProps) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"), {
        noSsr: true,
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={fullScreen}
            scroll="paper">
            <DialogTitle sx={{ m: 0, p: 2, pr: 5 }}>
                Daily Production Details
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent
                dividers
                sx={{
                    maxHeight: { xs: "calc(100dvh - 96px)", sm: 600 },
                    p: { xs: 1.5, sm: 2 },
                    overflowX: "hidden",
                }}>
                {Object.keys(groupedList).length > 0 ? (
                    <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{ boxShadow: "none", borderRadius: 1 }}>
                        <Table
                            size="small"
                            sx={{ tableLayout: "fixed", width: "100%" }}>
                            <TableHead>
                                <TableRow
                                    sx={{ bgcolor: "rgba(201, 162, 39, 0.1)" }}>
                                    <TableCell
                                        sx={{ width: "35%", fontWeight: 700 }}>
                                        Product Name
                                    </TableCell>
                                    <TableCell
                                        sx={{ width: "45%", fontWeight: 700 }}>
                                        Variant
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{ width: "20%", fontWeight: 700 }}>
                                        Quantity
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(groupedList).map(
                                    ([productName, productData], i) => (
                                        <React.Fragment key={productName}>
                                            {Object.entries(
                                                productData.variants
                                            ).map(
                                                (
                                                    [variantName, variant],
                                                    idx
                                                ) => (
                                                    <TableRow
                                                        key={`${productName}-${idx}`}
                                                        sx={{
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "rgba(0, 0, 0, 0.02)",
                                                            },
                                                        }}>
                                                        <TableCell
                                                            sx={{
                                                                wordBreak:
                                                                    "break-word",
                                                                whiteSpace:
                                                                    "normal",
                                                                verticalAlign:
                                                                    "top",
                                                                fontWeight: 600,
                                                                color: "#111827",
                                                            }}>
                                                            {idx === 0
                                                                ? productName
                                                                : ""}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                wordBreak:
                                                                    "break-word",
                                                                whiteSpace:
                                                                    "normal",
                                                                verticalAlign:
                                                                    "top",
                                                            }}>
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    display:
                                                                        "inline-block",
                                                                    px: 1,
                                                                    py: 0.25,
                                                                    borderRadius: 1,
                                                                    bgcolor:
                                                                        "rgba(0, 0, 0, 0.04)",
                                                                    color: "#374151",
                                                                    fontSize:
                                                                        "11px",
                                                                    fontWeight: 600,
                                                                }}>
                                                                {variantName}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell
                                                            align="right"
                                                            sx={{
                                                                verticalAlign:
                                                                    "top",
                                                                whiteSpace:
                                                                    "normal",
                                                                fontWeight: 600,
                                                                color: "#111827",
                                                            }}>
                                                            {new Intl.NumberFormat(
                                                                "en-US"
                                                            ).format(
                                                                variant.total
                                                            )}{" "}
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    fontSize:
                                                                        "12px",
                                                                    color: "#9CA3AF",
                                                                    fontWeight: 400,
                                                                }}>
                                                                {variant.unit ===
                                                                "KG"
                                                                    ? "kg"
                                                                    : variant.unit ===
                                                                      "TRAY"
                                                                    ? "tray"
                                                                    : "pcs"}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                            {i <
                                                Object.keys(groupedList)
                                                    .length -
                                                    1 && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        sx={{ p: 0 }}>
                                                        <Divider />
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                        <Typography color="text.secondary">
                            No products to produce.
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ProductionDetailsModal;
