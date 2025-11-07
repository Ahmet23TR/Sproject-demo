// src/app/admin/dashboard/components/DashboardStats.tsx
import { Box, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import CakeIcon from "@mui/icons-material/Cake";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const StatCard = ({
    title,
    value,
    icon,
    isRevenue = false,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    isRevenue?: boolean;
}) => {
    const formatValue = (val: number) => {
        if (isRevenue) {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "AED",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(val);
        }
        return val.toString();
    };

    return (
        <Box
            bgcolor="#fff"
            borderRadius={3}
            boxShadow="0 2px 12px 0 rgba(0,0,0,0.04)"
            p={3}
            display="flex"
            alignItems="center"
            gap={2}>
            <Box bgcolor="#E8F7F0" borderRadius={2} p={1.5} display="flex">
                {icon}
            </Box>
            <Box>
                <Typography variant="h6" fontWeight={700} color="#27AE60">
                    {formatValue(value)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
            </Box>
        </Box>
    );
};

interface DashboardStatsProps {
    totalCustomerCount: number;
    todaysTotalRevenue?: number;
    quantitySummary: Array<{
        productGroup: "SWEETS" | "BAKERY";
        unit: "PIECE" | "KG" | "TRAY";
        total: number;
    }>;
}

export const DashboardStats = ({
    totalCustomerCount,
    todaysTotalRevenue,
    quantitySummary,
}: DashboardStatsProps) => {
    // Helper function: generate title
    const getCardTitle = (productGroup?: string, unit?: string) => {
        if (!productGroup || !unit) return "Unknown";
        const groupLabel =
            productGroup === "SWEETS"
                ? "Sweets"
                : productGroup === "BAKERY"
                    ? "Bakery Products"
                    : productGroup;

        // SWEETS için PIECE yerine TRAY göster
        let unitLabel = unit;
        if (productGroup === "SWEETS" && unit === "PIECE") {
            unitLabel = "TRAY";
        }
        const displayUnit =
            unitLabel === "KG"
                ? "KG"
                : unitLabel === "PIECE"
                    ? "Piece"
                    : unitLabel === "TRAY"
                        ? "Tray"
                        : unitLabel;

        return `${groupLabel} (${displayUnit})`;
    };
    // Helper function: select icon
    const getIcon = (productGroup?: string) => {
        if (productGroup === "BAKERY")
            return <BakeryDiningIcon sx={{ color: "#27AE60", fontSize: 32 }} />;
        if (productGroup === "SWEETS")
            return <CakeIcon sx={{ color: "#27AE60", fontSize: 32 }} />;
        return <PeopleIcon sx={{ color: "#27AE60", fontSize: 32 }} />;
    };
    // Normalize quantitySummary from backend
    const normalizedSummary = quantitySummary.map((item) => {
        let normalizedUnit = item.unit || "PIECE";

        // SWEETS için PIECE'i TRAY'e çevir
        if (item.productGroup === "SWEETS" && normalizedUnit === "PIECE") {
            normalizedUnit = "TRAY";
        }

        const legacyGroup = (item as { group?: string }).group;
        return {
            productGroup: item.productGroup || legacyGroup || "Unknown",
            unit: normalizedUnit,
            total: item.total,
        };
    });

    // Toplam kart sayısını hesapla (müşteri + gelir + ürün kartları)
    const totalCards =
        1 +
        (todaysTotalRevenue !== undefined ? 1 : 0) +
        normalizedSummary.length;

    return (
        <Box
            display="grid"
            gridTemplateColumns={{
                xs: "1fr",
                sm: `repeat(${Math.min(totalCards, 4)}, 1fr)`,
            }}
            gap={3}
            mb={5}>
            <StatCard
                title="Today's Customers"
                value={totalCustomerCount}
                icon={<PeopleIcon sx={{ color: "#27AE60", fontSize: 32 }} />}
            />

            {/* Gelir kartını sadece değer tanımlıysa göster; 0 geçerli bir değerdir */}
            {todaysTotalRevenue !== undefined &&
                Number.isFinite(Number(todaysTotalRevenue)) && (
                    <StatCard
                        title="Today's Revenue"
                        value={Number(todaysTotalRevenue)}
                        icon={
                            <AttachMoneyIcon
                                sx={{ color: "#27AE60", fontSize: 32 }}
                            />
                        }
                        isRevenue={true}
                    />
                )}

            {normalizedSummary.map((item) => (
                <StatCard
                    key={item.productGroup + "-" + item.unit}
                    title={getCardTitle(item.productGroup, item.unit)}
                    value={item.total}
                    icon={getIcon(item.productGroup)}
                />
            ))}
        </Box>
    );
};
