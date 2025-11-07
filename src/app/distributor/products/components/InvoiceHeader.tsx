"use client";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { format, isToday } from "date-fns";

interface InvoiceHeaderProps {
    selectedDate: Date;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
}

export const InvoiceHeader = ({
    selectedDate,
    onPreviousDay,
    onNextDay,
    onToday,
}: InvoiceHeaderProps) => {
    const isCurrentDay = isToday(selectedDate);

    return (
        <Box>
            {/* Company Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                    flexWrap: { xs: "wrap", md: "nowrap" },
                    gap: 2,
                }}
            >
                {/* Left: Company Info */}
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            color: "#000000",
                            fontSize: { xs: "24px", sm: "32px" },
                            mb: 1,
                        }}
                    >
                        Deras
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6B7280",
                            fontSize: "14px",
                            lineHeight: 1.6,
                        }}
                    >
                        Daily Product Summary
                    </Typography>
                </Box>

                {/* Right: Date Info with Navigation */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 0.5,
                    }}
                >
                    {/* Date Label */}
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#9CA3AF",
                            fontSize: "12px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        Date
                    </Typography>

                    {/* Date Display with Navigation Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        {/* Date Info */}
                        <Box sx={{ textAlign: "right" }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontWeight: 600,
                                    color: "#111827",
                                    fontSize: { xs: "18px", sm: "20px" },
                                }}
                            >
                                {format(selectedDate, "dd/MM/yyyy")}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#6B7280",
                                    fontSize: "13px",
                                    mt: 0.25,
                                }}
                            >
                                {format(selectedDate, "EEEE")}
                                {isCurrentDay && (
                                    <Typography
                                        component="span"
                                        sx={{
                                            color: "#C9A227",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            ml: 1,
                                        }}
                                    >
                                        • Today
                                    </Typography>
                                )}
                            </Typography>
                        </Box>

                        {/* Navigation Buttons */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                            }}
                        >
                            {/* Previous Day */}
                            <IconButton
                                onClick={onPreviousDay}
                                size="small"
                                sx={{
                                    bgcolor: "#F5F5F5",
                                    color: "#111827",
                                    width: 32,
                                    height: 32,
                                    "&:hover": {
                                        bgcolor: "#E0E0E0",
                                    },
                                }}
                                aria-label="Previous day"
                            >
                                <ChevronLeftIcon fontSize="small" />
                            </IconButton>

                            {/* Today Button */}
                            {!isCurrentDay && (
                                <IconButton
                                    onClick={onToday}
                                    size="small"
                                    sx={{
                                        bgcolor: "#C9A227",
                                        color: "#FFFFFF",
                                        width: 32,
                                        height: 32,
                                        "&:hover": {
                                            bgcolor: "#B89020",
                                        },
                                    }}
                                    aria-label="Go to today"
                                >
                                    <TodayIcon fontSize="small" />
                                </IconButton>
                            )}

                            {/* Next Day */}
                            <IconButton
                                onClick={onNextDay}
                                size="small"
                                sx={{
                                    bgcolor: "#F5F5F5",
                                    color: "#111827",
                                    width: 32,
                                    height: 32,
                                    "&:hover": {
                                        bgcolor: "#E0E0E0",
                                    },
                                }}
                                aria-label="Next day"
                            >
                                <ChevronRightIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ borderColor: "#000000", borderWidth: 2, mb: 3 }} />
        </Box>
    );
};

