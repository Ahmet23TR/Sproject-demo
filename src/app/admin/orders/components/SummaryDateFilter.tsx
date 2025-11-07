"use client";
import { Box, FormControl, Select, MenuItem, Typography } from "@mui/material";
import { SummaryDateFilter as SummaryDateFilterType } from "../../../../hooks/admin/useAdminOrdersSummary";

interface SummaryDateFilterProps {
    value: SummaryDateFilterType;
    onChange: (value: SummaryDateFilterType) => void;
    compact?: boolean;
}

const dateFilterOptions = [
    { value: "ALL_TIME" as const, label: "All Time" },
    { value: "TODAY" as const, label: "Today" },
    { value: "THIS_WEEK" as const, label: "This Week" },
    { value: "LAST_WEEK" as const, label: "Last Week" },
    { value: "THIS_MONTH" as const, label: "This Month" },
    { value: "LAST_MONTH" as const, label: "Last Month" },
    { value: "THIS_YEAR" as const, label: "This Year" },
    { value: "LAST_YEAR" as const, label: "Last Year" },
];

export const SummaryDateFilter = ({ value, onChange, compact = false }: SummaryDateFilterProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexShrink: 0,
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "space-between", md: "flex-start" },
            }}
        >
            <Typography
                variant={compact ? "caption" : "body2"}
                sx={{
                    color: compact ? "text.secondary" : "#64748b",
                    fontWeight: compact ? 600 : 600,
                    textTransform: "uppercase",
                    letterSpacing: compact ? 0.5 : 0.8,
                    whiteSpace: "nowrap",
                }}
            >
                Summary Period:
            </Typography>
            <FormControl size="small" sx={{ minWidth: compact ? 120 : { xs: 140, md: 160 } }}>
                <Select
                    value={value}
                    onChange={(e) => onChange(e.target.value as SummaryDateFilterType)}
                    sx={{
                        borderRadius: 3,
                        backgroundColor: "white",
                        height: compact ? 36 : 44,
                        boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.08)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        "& .MuiSelect-select": {
                            py: compact ? 0.75 : 1.5,
                            px: compact ? 1.5 : 2.5,
                            fontSize: compact ? "0.8rem" : "0.875rem",
                            fontWeight: 600,
                            color: "#1f2937",
                            display: "flex",
                            alignItems: "center",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                        },
                        "&:hover": {
                            borderColor: "rgba(201, 162, 39, 0.4)",
                            boxShadow: "0px 6px 16px rgba(15, 23, 42, 0.12)",
                        },
                        "&.Mui-focused": {
                            borderColor: "#C9A227",
                            boxShadow: "0 0 0 3px rgba(201, 162, 39, 0.1)",
                        },
                        "& .MuiSelect-icon": {
                            color: "#C9A227",
                        },
                    }}
                >
                    {dateFilterOptions.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                            sx={{
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                py: 1.5,
                                "&:hover": {
                                    backgroundColor: "rgba(201, 162, 39, 0.08)",
                                },
                                "&.Mui-selected": {
                                    backgroundColor: "rgba(201, 162, 39, 0.12)",
                                    fontWeight: 600,
                                    "&:hover": {
                                        backgroundColor: "rgba(201, 162, 39, 0.16)",
                                    },
                                },
                            }}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};
