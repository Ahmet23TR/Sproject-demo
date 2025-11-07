import React from "react";
import { Box, Button, Paper } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enUS } from "date-fns/locale";

export interface CustomerKPIFilters {
    startDate: Date | null;
    endDate: Date | null;
}

interface Props {
    filters: CustomerKPIFilters;
    onChange: (patch: Partial<CustomerKPIFilters>) => void;
    onApply: () => void;
    onClear: () => void;
    loading?: boolean;
}

export const CustomerKPIFilters: React.FC<Props> = ({
    filters,
    onChange,
    onApply,
    onClear,
    loading = false,
}) => {
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
        const patch = getQuickDateRange(type);
        onChange(patch);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                        <DatePicker
                            label="Start Date"
                            value={filters.startDate}
                            onChange={(date) => onChange({ startDate: date })}
                            slotProps={{ textField: { fullWidth: true, size: "small", sx: { flex: 1 } } }}
                        />
                        <DatePicker
                            label="End Date"
                            value={filters.endDate}
                            onChange={(date) => onChange({ endDate: date })}
                            slotProps={{ textField: { fullWidth: true, size: "small", sx: { flex: 1 } } }}
                        />
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button size="small" variant="outlined" onClick={() => handleQuickDate("thisMonth")}>This Month</Button>
                        <Button size="small" variant="outlined" onClick={() => handleQuickDate("lastMonth")}>Last Month</Button>
                        <Button size="small" variant="outlined" onClick={() => handleQuickDate("last3Months")}>Last 3 Months</Button>
                        <Button size="small" variant="outlined" onClick={() => handleQuickDate("thisYear")}>This Year</Button>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                        <Button variant="outlined" onClick={onClear} disabled={loading}>
                            Clear
                        </Button>
                        <Button variant="contained" onClick={onApply} disabled={loading}>
                            {loading ? "Loading..." : "Apply"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </LocalizationProvider>
    );
};

export default CustomerKPIFilters;

