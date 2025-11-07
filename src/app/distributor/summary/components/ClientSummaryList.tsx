"use client";
import { Box, Typography, Card } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import ReceiptIcon from "@mui/icons-material/Receipt";
import type { DistributorClientSummary } from "@/types/data";

interface ClientSummaryListProps {
    clients: DistributorClientSummary[];
}

interface ClientCardProps {
    client: DistributorClientSummary;
}

const ClientCard = ({ client }: ClientCardProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Card
            sx={{
                bgcolor: "#FFFFFF",
                borderRadius: 2,
                p: { xs: 2, sm: 2.5, md: 3 },
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.06)",
                boxShadow: "0 2px 12px rgba(17, 24, 39, 0.05)",
                transition: "all 0.2s ease",
                "&:hover": {
                    boxShadow: "0 4px 20px rgba(17, 24, 39, 0.1)",
                    borderColor: "rgba(201, 162, 39, 0.3)",
                },
            }}
        >
            {/* Header: Client Name and Total */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    mb: 2,
                    gap: 2,
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon sx={{ color: "#C9A227", fontSize: 20 }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 600,
                                color: "#111827",
                                fontSize: { xs: "16px", sm: "18px" },
                            }}
                        >
                            {client.clientName}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#9CA3AF",
                            fontSize: "12px",
                            mb: 0.5,
                        }}
                    >
                        Daily Total
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            color: "#C9A227",
                            fontSize: { xs: "18px", sm: "20px" },
                        }}
                    >
                        {formatCurrency(client.clientDailyTotal)}
                    </Typography>
                </Box>
            </Box>

            {/* Client Details */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {/* Address */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <LocationOnIcon
                        sx={{
                            color: "#9CA3AF",
                            fontSize: 18,
                            mt: 0.2,
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6B7280",
                            fontSize: "14px",
                            lineHeight: 1.5,
                        }}
                    >
                        {client.clientAddress}
                    </Typography>
                </Box>

                {/* Phone Number */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon sx={{ color: "#9CA3AF", fontSize: 18 }} />
                    <a
                        href={`tel:${client.clientPhoneNumber}`}
                        style={{
                            textDecoration: "none",
                            color: "#3B82F6",
                            fontSize: "14px",
                            fontWeight: 500,
                        }}
                    >
                        {client.clientPhoneNumber}
                    </a>
                </Box>

                {/* Number of Orders */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ReceiptIcon sx={{ color: "#9CA3AF", fontSize: 18 }} />
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6B7280",
                            fontSize: "14px",
                        }}
                    >
                        {client.numberOfOrders}{" "}
                        {client.numberOfOrders === 1 ? "Order" : "Orders"}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

export const ClientSummaryList = ({ clients }: ClientSummaryListProps) => {
    if (clients.length === 0) {
        return (
            <Box
                sx={{
                    bgcolor: "#FFFFFF",
                    borderRadius: 3,
                    p: { xs: 4, sm: 6 },
                    border: "1px solid",
                    borderColor: "rgba(0, 0, 0, 0.06)",
                    boxShadow: "0 4px 20px rgba(17, 24, 39, 0.06)",
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        color: "#9CA3AF",
                        fontSize: { xs: "16px", sm: "18px" },
                        fontWeight: 500,
                    }}
                >
                    No orders found for this date
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Typography
                variant="h6"
                sx={{
                    fontFamily:
                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 600,
                    color: "#111827",
                    fontSize: { xs: "18px", sm: "20px" },
                    mb: 2.5,
                }}
            >
                Client Summary ({clients.length})
            </Typography>

            {/* Client Cards Grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, 1fr)",
                    },
                    gap: { xs: 2, sm: 2.5, md: 3 },
                }}
            >
                {clients.map((client) => (
                    <ClientCard key={client.clientId} client={client} />
                ))}
            </Box>
        </Box>
    );
};

