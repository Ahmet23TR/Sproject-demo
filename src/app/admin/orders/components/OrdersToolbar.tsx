"use client";
import {
    Box,
    TextField,
    Button,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export interface FilterOption<T extends string> {
    label: string;
    value: T;
}

interface OrdersToolbarProps<Status extends string, DateKey extends string> {
    statusOptions: FilterOption<Status>[];
    statusValue: Status;
    onStatusChange: (status: Status) => void;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    dateOptions?: FilterOption<DateKey>[];
    dateValue?: DateKey;
    onDateChange?: (range: DateKey) => void;
    onCustomDateRange?: (startDate: Date, endDate: Date) => void;
    onCreateOrder?: () => void;
    selectedCount?: number;
}

export function OrdersToolbar<Status extends string, DateKey extends string>({
    statusOptions,
    statusValue,
    onStatusChange,
}: OrdersToolbarProps<Status, DateKey>) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                },
                gap: 2,
                mb: 3,
                alignItems: "center",
            }}>
            <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select
                    value={statusValue}
                    onChange={(e) => onStatusChange(e.target.value as Status)}
                    label="Status"
                    sx={{
                        borderRadius: 2,
                    }}
                    IconComponent={KeyboardArrowDownIcon}>
                    {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* <FormControl size="small">
                <InputLabel>Customer</InputLabel>
                <Select
                    label="Customer"
                    defaultValue="All"
                    sx={{
                        borderRadius: 2,
                    }}
                    IconComponent={KeyboardArrowDownIcon}>
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Individual">Individual</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                </Select>
            </FormControl> */}

            <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                    size="small"
                    placeholder="0.00"
                    label="From"
                    sx={{ flex: 1, borderRadius: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                AED
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    size="small"
                    placeholder="0.00"
                    label="To"
                    sx={{ flex: 1, borderRadius: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                AED
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
            <Button
                variant="contained"
                sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    backgroundColor: "primary.main",
                    "&:hover": {
                        backgroundColor: "primary.dark",
                    },
                }}>
                Filter
            </Button>
        </Box>
    );
}
