import React from "react";
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Paper,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export interface CustomerTableFilters {
    sortBy:
        | "totalSpending"
        | "orderCount"
        | "averageOrderValue"
        | "firstOrderDate"
        | "lastOrderDate";
    sortOrder: "asc" | "desc";
    search: string;
    page: number;
    limit: number;
    orderCountMin?: number | null;
    orderCountMax?: number | null;
    totalSpendingMin?: number | null;
    totalSpendingMax?: number | null;
    aovMin?: number | null;
    aovMax?: number | null;
    activityStatus?:
        | "ALL"
        | "ACTIVE_30"
        | "RISK_31_60"
        | "RISK_61_90"
        | "DORMANT_90_PLUS";
    customerType?: "ALL" | "COMPANY" | "INDIVIDUAL";
    priceList?: string;
}

interface Props {
    filters: CustomerTableFilters;
    onChange: (patch: Partial<CustomerTableFilters>) => void;
    onApply: () => void;
    onClear: () => void;
    loading?: boolean;
}

export const CustomerTableFiltersComponent: React.FC<Props> = ({
    filters,
    onChange,
    onApply,
    onClear,
    loading = false,
}) => {
    const sortOptions = [
        { value: "totalSpending", label: "Total Spending" },
        { value: "orderCount", label: "Order Count" },
        { value: "averageOrderValue", label: "Average Order Value" },
        { value: "firstOrderDate", label: "First Order Date" },
        { value: "lastOrderDate", label: "Last Order Date" },
    ];

    const sortOrderOptions = [
        { value: "desc", label: "High to Low" },
        { value: "asc", label: "Low to High" },
    ];

    const limitOptions = [
        { value: 10, label: "10 results" },
        { value: 25, label: "25 results" },
        { value: 50, label: "50 results" },
        { value: 100, label: "100 results" },
    ];

    const activityOptions = [
        { value: "ALL", label: "All activity" },
        { value: "ACTIVE_30", label: "Active (≤30d)" },
        { value: "RISK_31_60", label: "Low Risk (31–60d)" },
        { value: "RISK_61_90", label: "Med Risk (61–90d)" },
        { value: "DORMANT_90_PLUS", label: "High Risk (>90d)" },
    ];

    // const customerTypeOptions = [
    //     { value: "ALL", label: "All types" },
    //     { value: "COMPANY", label: "Company" },
    //     { value: "INDIVIDUAL", label: "Individual" },
    // ];

    const hasActive = Boolean(
        filters.search ||
            filters.orderCountMin != null ||
            filters.orderCountMax != null ||
            filters.totalSpendingMin != null ||
            filters.totalSpendingMax != null ||
            filters.aovMin != null ||
            filters.aovMax != null ||
            (filters.activityStatus && filters.activityStatus !== "ALL") ||
            (filters.customerType && filters.customerType !== "ALL") ||
            (filters.priceList && filters.priceList.length > 0) ||
            filters.sortBy !== "totalSpending" ||
            filters.sortOrder !== "desc"
    );

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Primary row */}
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "nowrap",
                        alignItems: "center",
                        gap: 2,
                        overflowX: "auto",
                        pb: 1,
                    }}>
                    <TextField
                        size="small"
                        label="Search Customer"
                        placeholder="Name, company or email..."
                        value={filters.search}
                        onChange={(e) =>
                            onChange({ search: e.target.value, page: 1 })
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 240, flex: "0 0 auto" }}
                    />

                    <FormControl size="small" sx={{ minWidth: 180, flex: "0 0 auto" }}>
                        <InputLabel>Activity</InputLabel>
                        <Select
                            value={filters.activityStatus ?? "ALL"}
                            label="Activity"
                            onChange={(e: SelectChangeEvent) =>
                                onChange({
                                    activityStatus: e.target
                                        .value as NonNullable<
                                        typeof filters.activityStatus
                                    >,
                                    page: 1,
                                })
                            }>
                            {activityOptions.map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 180, flex: "0 0 auto" }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={filters.sortBy}
                            label="Sort By"
                            onChange={(e: SelectChangeEvent) =>
                                onChange({
                                    sortBy: e.target
                                        .value as typeof filters.sortBy,
                                    page: 1,
                                })
                            }>
                            {sortOptions.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160, flex: "0 0 auto" }}>
                        <InputLabel>Sort Order</InputLabel>
                        <Select
                            value={filters.sortOrder}
                            label="Sort Order"
                            onChange={(e: SelectChangeEvent) =>
                                onChange({
                                    sortOrder: e.target
                                        .value as typeof filters.sortOrder,
                                    page: 1,
                                })
                            }>
                            {sortOrderOptions.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140, flex: "0 0 auto" }}>
                        <InputLabel>Page Size</InputLabel>
                        <Select
                            value={filters.limit}
                            label="Page Size"
                            onChange={(e: SelectChangeEvent<number>) =>
                                onChange({
                                    limit: e.target.value as number,
                                    page: 1,
                                })
                            }>
                            {limitOptions.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {hasActive && (
                        <Button
                            variant="outlined"
                            onClick={onClear}
                            startIcon={<ClearIcon />}
                            disabled={loading}
                            sx={{ flex: "0 0 auto" }}>
                            Clear
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={onApply}
                        disabled={loading}
                        sx={{ minWidth: 130, flex: "0 0 auto" }}>
                        {loading ? "Loading..." : "Apply Filters"}
                    </Button>
                </Box>
                {/* 
                    <FormControl fullWidth size="small">
                        <InputLabel>Customer Type</InputLabel>
                        <Select
                            value={filters.customerType ?? "ALL"}
                            label="Customer Type"
                            onChange={(e: SelectChangeEvent) =>
                                onChange({
                                    customerType: e.target.value as NonNullable<
                                        typeof filters.customerType
                                    >,
                                    page: 1,
                                })
                            }>
                            {customerTypeOptions.map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        size="small"
                        label="Price List"
                        placeholder="e.g. Retail, Dealer..."
                        value={filters.priceList ?? ""}
                        onChange={(e) =>
                            onChange({ priceList: e.target.value, page: 1 })
                        }
                    /> */}

                {/* Metrics row 
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(6, 1fr)",
                        },
                        gap: 2,
                    }}>
                    <TextField
                        size="small"
                        label="Orders ≥"
                        type="number"
                        value={filters.orderCountMin ?? ""}
                        onChange={(e) =>
                            onChange({
                                orderCountMin:
                                    e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                page: 1,
                            })
                        }
                    />
                    <TextField
                        size="small"
                        label="Orders ≤"
                        type="number"
                        value={filters.orderCountMax ?? ""}
                        onChange={(e) =>
                            onChange({
                                orderCountMax:
                                    e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                page: 1,
                            })
                        }
                    />
                    <TextField
                        size="small"
                        label="Spending ≥ (AED)"
                        type="number"
                        value={filters.totalSpendingMin ?? ""}
                        onChange={(e) =>
                            onChange({
                                totalSpendingMin:
                                    e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                page: 1,
                            })
                        }
                    />
                    <TextField
                        size="small"
                        label="Spending ≤ (AED)"
                        type="number"
                        value={filters.totalSpendingMax ?? ""}
                        onChange={(e) =>
                            onChange({
                                totalSpendingMax:
                                    e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                page: 1,
                            })
                        }
                    />
                    <TextField
                        size="small"
                        label="AOV ≥ (AED)"
                        type="number"
                        value={filters.aovMin ?? ""}
                        onChange={(e) =>
                            onChange({
                                aovMin:
                                    e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                page: 1,
                            })
                        }
                    />
                    <TextField
                        size="small"
                        label="AOV ≤ (AED)"
                        type="number"
                        value={filters.aovMax ?? ""}
                        onChange={(e) =>
                            onChange({
                                aovMax:
                                    e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                page: 1,
                            })
                        }
                    />
                </Box> */}

                {/* Sort & page size 
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                        gap: 2,
                    }}></Box>

                    */}

                {/* Actions 
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        mt: 1,
                        justifyContent: "flex-end",
                    }}>
                   
                </Box>
                */}
            </Box>
        </Paper>
    );
};

export default CustomerTableFiltersComponent;
