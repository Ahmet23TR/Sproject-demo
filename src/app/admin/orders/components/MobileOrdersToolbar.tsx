"use client";
import {
    Box,
    TextField,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    Button,
    Popover,
    Typography,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { DatePickerField } from "../../../../components/DatePickerField";
import { useState } from "react";

type DateFilterKey =
    | "ALL"
    | "TODAY"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "THIS_YEAR"
    | "LAST_YEAR"
    | "CUSTOM";

interface MobileOrdersToolbarProps {
    statusOptions: Array<{ label: string; value: string }>;
    statusValue: string;
    onStatusChange: (value: string) => void;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    dateValue: DateFilterKey;
    onDateChange: (key: DateFilterKey) => void;
    onCustomDateRange: (start: Date, end: Date) => void;
    startDateStr?: string;
    endDateStr?: string;
    minAmount?: number | null;
    maxAmount?: number | null;
    onAmountRangeChange: (min: number | null, max: number | null) => void;
}

export const MobileOrdersToolbar = ({
    statusOptions,
    statusValue,
    onStatusChange,
    searchQuery,
    onSearchChange,
    onDateChange,
    onCustomDateRange,
    startDateStr = "",
    endDateStr = "",
    minAmount = null,
    maxAmount = null,
    onAmountRangeChange,
}: MobileOrdersToolbarProps) => {
    const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
    const [minInput, setMinInput] = useState<string>(
        minAmount != null ? String(minAmount) : ""
    );
    const [maxInput, setMaxInput] = useState<string>(
        maxAmount != null ? String(maxAmount) : ""
    );
    const [startInput, setStartInput] = useState<string>(startDateStr ?? "");
    const [endInput, setEndInput] = useState<string>(endDateStr ?? "");

    const handleOpenFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
        setFilterAnchor(e.currentTarget);
        setMinInput(minAmount != null ? String(minAmount) : "");
        setMaxInput(maxAmount != null ? String(maxAmount) : "");
        setStartInput(startDateStr || "");
        setEndInput(endDateStr || "");
    };
    const handleCloseFilter = () => setFilterAnchor(null);

    const applyFilter = () => {
        const min =
            minInput !== "" && !isNaN(Number(minInput))
                ? Number(minInput)
                : null;
        const max =
            maxInput !== "" && !isNaN(Number(maxInput))
                ? Number(maxInput)
                : null;
        onAmountRangeChange(min, max);

        if (startInput && endInput) {
            const start = new Date(startInput);
            const end = new Date(endInput);

            if (start > end) {
                onCustomDateRange(end, start);
            } else {
                onCustomDateRange(start, end);
            }
        } else if (!startInput && !endInput) {
            onDateChange("ALL");
        }
        handleCloseFilter();
    };

    const resetFilter = () => {
        setMinInput("");
        setMaxInput("");
        setStartInput("");
        setEndInput("");
        onAmountRangeChange(null, null);
        onDateChange("ALL");
    };

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mb: 2,
                }}>
                <TextField
                    size="small"
                    placeholder="Search orders..."
                    value={searchQuery ?? ""}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchRoundedIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                    sx={{ backgroundColor: "white", borderRadius: 2 }}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusValue}
                            onChange={(e) => onStatusChange(e.target.value as string)}
                            label="Status"
                            IconComponent={KeyboardArrowDownIcon}
                            sx={{ borderRadius: 2, backgroundColor: "white" }}>
                            {statusOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListRoundedIcon />}
                        onClick={handleOpenFilter}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            minWidth: 100,
                        }}>
                        Filter
                    </Button>
                </Box>
            </Box>

            <Popover
                open={Boolean(filterAnchor)}
                anchorEl={filterAnchor}
                onClose={handleCloseFilter}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                PaperProps={{
                    sx: {
                        p: 2,
                        width: "calc(100vw - 32px)",
                        maxWidth: 400,
                        borderRadius: 2,
                    },
                }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: "#374151" }}>
                    Filter Orders
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusValue}
                        label="Status"
                        onChange={(e) => onStatusChange(e.target.value as string)}
                        IconComponent={KeyboardArrowDownIcon}>
                        {statusOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                    <TextField
                        label="Min"
                        size="small"
                        type="number"
                        value={minInput}
                        onChange={(e) => setMinInput(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">AED</InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                    <TextField
                        label="Max"
                        size="small"
                        type="number"
                        value={maxInput}
                        onChange={(e) => setMaxInput(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">AED</InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                    <DatePickerField
                        label="From"
                        value={startInput}
                        onChange={setStartInput}
                        size="small"
                        fullWidth
                    />
                    <DatePickerField
                        label="To"
                        value={endInput}
                        onChange={setEndInput}
                        size="small"
                        fullWidth
                    />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                    }}>
                    <Button
                        variant="text"
                        onClick={resetFilter}
                        sx={{ textTransform: "none" }}>
                        Reset
                    </Button>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            onClick={handleCloseFilter}
                            sx={{ textTransform: "none" }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={applyFilter}
                            sx={{ textTransform: "none" }}>
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
};

