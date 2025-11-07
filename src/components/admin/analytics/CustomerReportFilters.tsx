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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enUS } from "date-fns/locale";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

export interface CustomerReportFilters {
    startDate: Date | null;
    endDate: Date | null;
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
}

interface CustomerReportFiltersProps {
    filters: CustomerReportFilters;
    onFiltersChange: (filters: Partial<CustomerReportFilters>) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    loading?: boolean;
}

export const CustomerReportFiltersComponent: React.FC<
    CustomerReportFiltersProps
> = ({
    filters,
    onFiltersChange,
    onApplyFilters,
    onClearFilters,
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

    // Quick date presets
    const getQuickDateRange = (
        type: "thisMonth" | "lastMonth" | "last3Months" | "thisYear"
    ) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        switch (type) {
            case "thisMonth":
                return {
                    startDate: new Date(currentYear, currentMonth, 1),
                    endDate: new Date(currentYear, currentMonth + 1, 0),
                };
            case "lastMonth":
                return {
                    startDate: new Date(currentYear, currentMonth - 1, 1),
                    endDate: new Date(currentYear, currentMonth, 0),
                };
            case "last3Months":
                return {
                    startDate: new Date(currentYear, currentMonth - 2, 1),
                    endDate: new Date(currentYear, currentMonth + 1, 0),
                };
            case "thisYear":
                return {
                    startDate: new Date(currentYear, 0, 1),
                    endDate: new Date(currentYear, 11, 31),
                };
            default:
                return { startDate: null, endDate: null };
        }
    };

    const handleQuickDate = (
        type: "thisMonth" | "lastMonth" | "last3Months" | "thisYear"
    ) => {
        const dateRange = getQuickDateRange(type);
        onFiltersChange(dateRange);
    };

    const hasActiveFilters = Boolean(
        filters.startDate ||
            filters.endDate ||
            filters.search ||
            filters.sortBy !== "totalSpending" ||
            filters.sortOrder !== "desc"
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <FilterListIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Box
                        component="span"
                        sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                        Filtering and Search
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Date Range Section */}
                    <Box>
                        <Box sx={{ mb: 2 }}>
                            <Box
                                component="span"
                                sx={{
                                    fontWeight: 500,
                                    fontSize: "0.9rem",
                                    color: "text.secondary",
                                }}>
                                Date Range
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: 2,
                                mb: 2,
                            }}>
                            <DatePicker
                                label="Start Date"
                                value={filters.startDate}
                                onChange={(date) =>
                                    onFiltersChange({ startDate: date })
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        sx: { flex: 1 },
                                    },
                                }}
                            />
                            <DatePicker
                                label="End Date"
                                value={filters.endDate}
                                onChange={(date) =>
                                    onFiltersChange({ endDate: date })
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        sx: { flex: 1 },
                                    },
                                }}
                            />
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleQuickDate("thisMonth")}>
                                This Month
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleQuickDate("lastMonth")}>
                                Last Month
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleQuickDate("last3Months")}>
                                Last 3 Months
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleQuickDate("thisYear")}>
                                This Year
                            </Button>
                        </Box>
                    </Box>

                    {/* Search and Sort Section */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "2fr 1fr 1fr 1fr",
                            },
                            gap: 2,
                        }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Search Customer"
                            placeholder="Name, company name or email..."
                            value={filters.search}
                            onChange={(e) =>
                                onFiltersChange({
                                    search: e.target.value,
                                    page: 1,
                                })
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={filters.sortBy}
                                label="Sort By"
                                onChange={(e: SelectChangeEvent) =>
                                    onFiltersChange({
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

                        <FormControl fullWidth size="small">
                            <InputLabel>Sort Order</InputLabel>
                            <Select
                                value={filters.sortOrder}
                                label="Sort Order"
                                onChange={(e: SelectChangeEvent) =>
                                    onFiltersChange({
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

                        <FormControl fullWidth size="small">
                            <InputLabel>Page Size</InputLabel>
                            <Select
                                value={filters.limit}
                                label="Page Size"
                                onChange={(e: SelectChangeEvent<number>) =>
                                    onFiltersChange({
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
                    </Box>
                </Box>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        mt: 3,
                        justifyContent: "flex-end",
                    }}>
                    {hasActiveFilters && (
                        <Button
                            variant="outlined"
                            onClick={onClearFilters}
                            startIcon={<ClearIcon />}
                            disabled={loading}>
                            Clear
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={onApplyFilters}
                        disabled={loading}
                        sx={{ minWidth: 120 }}>
                        {loading ? "Loading..." : "Apply Filters"}
                    </Button>
                </Box>
            </Paper>
        </LocalizationProvider>
    );
};
