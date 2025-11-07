import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    CircularProgress,
    Alert,
} from "@mui/material";
import { Order, PaginationInfo } from "../../types/data";
import { useRouter } from "next/navigation";
import PaginationComponent from "../PaginationComponent";

interface UserOrderHistoryProps {
    orders: Order[];
    pagination: PaginationInfo | null;
    loading: boolean;
    error: string | null;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

export const UserOrderHistory = ({
    orders,
    pagination,
    loading,
    error,
    onPageChange
}: UserOrderHistoryProps) => {
    const router = useRouter();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            {orders.length === 0 ? (
                <Typography>
                    This user has no order history.
                </Typography>
            ) : (
                <>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Total {pagination?.totalItems || orders.length} orders found.
                    </Typography>

                    <List component={Paper}>
                        {orders.map((order) => (
                            <ListItem
                                divider={order.id !== orders[orders.length - 1].id}
                                sx={{
                                    "&:hover": {
                                        background: "#f7faf7",
                                        cursor: "pointer",
                                    },
                                }}
                                key={order.id}
                                onClick={() =>
                                    router.push(`/admin/orders/${order.id}`)
                                }>
                                <ListItemText
                                    primary={`Order #${order.orderNumber}`}
                                    secondary={new Date(
                                        order.createdAt
                                    ).toLocaleString("en-US")}
                                />
                            </ListItem>
                        ))}
                    </List>
                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <Box mt={3}>
                            <PaginationComponent
                                pagination={pagination}
                                onPageChange={onPageChange}
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};
