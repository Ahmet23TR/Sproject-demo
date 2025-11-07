"use client";
import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { format, isToday } from "date-fns";

interface DatePickerSectionProps {
    selectedDate: Date;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
}

export const DatePickerSection = ({
    selectedDate,
    onPreviousDay,
    onNextDay,
    onToday,
}: DatePickerSectionProps) => {
    const isCurrentDay = isToday(selectedDate);

    return (
        <Box
            sx={{
                bgcolor: "#FFFFFF",
                borderRadius: 3,
                p: { xs: 2, sm: 3 },
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.06)",
                boxShadow: "0 4px 20px rgba(17, 24, 39, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
            }}
        >
            {/* Date Display */}
            <Box sx={{ flex: 1 }}>
                <Typography
                    variant="body2"
                    sx={{
                        color: "#9CA3AF",
                        fontSize: "14px",
                        fontWeight: 500,
                        mb: 0.5,
                    }}
                >
                    Selected Date
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily:
                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 600,
                        color: "#111827",
                        fontSize: { xs: "20px", sm: "24px" },
                    }}
                >
                    {format(selectedDate, "MMMM dd, yyyy")}
                </Typography>
                {isCurrentDay && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#C9A227",
                            fontSize: "12px",
                            fontWeight: 600,
                            mt: 0.5,
                        }}
                    >
                        Today
                    </Typography>
                )}
            </Box>

            {/* Navigation Controls */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Previous Day */}
                <IconButton
                    onClick={onPreviousDay}
                    sx={{
                        bgcolor: "#F5F5F5",
                        color: "#111827",
                        "&:hover": {
                            bgcolor: "#E0E0E0",
                        },
                    }}
                    aria-label="Previous day"
                >
                    <ChevronLeftIcon />
                </IconButton>

                {/* Today Button */}
                {!isCurrentDay && (
                    <IconButton
                        onClick={onToday}
                        sx={{
                            bgcolor: "#C9A227",
                            color: "#FFFFFF",
                            "&:hover": {
                                bgcolor: "#B89020",
                            },
                        }}
                        aria-label="Go to today"
                    >
                        <TodayIcon />
                    </IconButton>
                )}

                {/* Next Day */}
                <IconButton
                    onClick={onNextDay}
                    sx={{
                        bgcolor: "#F5F5F5",
                        color: "#111827",
                        "&:hover": {
                            bgcolor: "#E0E0E0",
                        },
                    }}
                    aria-label="Next day"
                >
                    <ChevronRightIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

