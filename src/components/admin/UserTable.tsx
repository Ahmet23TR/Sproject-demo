import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Stack,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { User } from "../../types/data";
import { UserRow } from "./UserRow";
import { UserCard } from "./UserCard";

interface UserTableProps {
    title: string;
    users: User[];
    currentUser: User | null;
    actionLoading: string | null;
    onActivate: (userId: string) => void;
    onDeactivate: (userId: string) => void;
    onUpdateChefProductGroup?: (
        chefId: string,
        productGroup: "SWEETS" | "BAKERY"
    ) => void;
    // Sorting props
    sortBy?: "name" | "createdAt" | null;
    sortDirection?: "asc" | "desc";
    onSort?: (column: "name" | "createdAt") => void;
}

export const UserTable = ({
    title,
    users,
    actionLoading,
    sortBy,
    sortDirection,
    onSort,
    ...props
}: UserTableProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Ensure users is always an array
    const safeUsers = Array.isArray(users) ? users : [];

    if (safeUsers.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 2, mb: 4 }}>
                No registered {title.toLowerCase()} found.
            </Alert>
        );
    }

    const renderSortableHeader = (
        label: string,
        sortColumn?: "name" | "createdAt"
    ) => {
        const isSorted = sortBy === sortColumn;
        const isAscending = isSorted && sortDirection === "asc";

        return (
            <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                    cursor: sortColumn ? "pointer" : "default",
                    "&:hover": sortColumn ? { color: "#374151" } : {},
                }}
                onClick={sortColumn ? () => onSort?.(sortColumn) : undefined}>
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                        color: "inherit",
                    }}>
                    {label}
                </Typography>
                {sortColumn && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.2,
                        }}>
                        <ArrowUpwardIcon
                            sx={{
                                fontSize: 12,
                                color:
                                    isSorted && isAscending
                                        ? "#3b82f6"
                                        : "#d1d5db",
                                transition: "color 0.2s",
                            }}
                        />
                        <ArrowDownwardIcon
                            sx={{
                                fontSize: 12,
                                color:
                                    isSorted && !isAscending
                                        ? "#3b82f6"
                                        : "#d1d5db",
                                transition: "color 0.2s",
                            }}
                        />
                    </Box>
                )}
            </Box>
        );
    };

    const columns: Array<{
        label: string;
        align?: "left" | "center" | "right";
        sortColumn?: "name" | "createdAt";
    }> =
        title === "Clients"
            ? [
                { label: "Customer Name", sortColumn: "name" },
                { label: "Email" },
                { label: "Phone" },
                { label: "Company" },
                { label: "Orders" },
                { label: "Order Total" },
                { label: "Customer Since", sortColumn: "createdAt" },
                { label: "Status" },
            ]
            : [
                { label: "Full Name" },
                { label: "Email" },
                { label: "Role" },
                // ...(title === "Chefs" ? [{ label: "Product Group" }] : []),
                { label: "Status" },
                // { label: "Action", align: "right" as const },
            ];

    return (
        <Box>
            {title && (
                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "#1f2937", mb: 2, fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                    {title}
                </Typography>
            )}

            {/* Mobile Card View */}
            {isMobile ? (
                <Stack spacing={2}>
                    {safeUsers.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            title={title}
                            actionLoading={actionLoading}
                        />
                    ))}
                </Stack>
            ) : (
                /* Desktop Table View */
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: "1px solid rgba(148, 163, 184, 0.25)",
                        overflow: "auto",
                        boxShadow: "0px 18px 32px rgba(15, 23, 42, 0.06)",
                        "&::-webkit-scrollbar": {
                            height: 8,
                        },
                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "#f1f5f9",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#cbd5e1",
                            borderRadius: 4,
                        },
                    }}>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead>
                            <TableRow
                                sx={{
                                    backgroundColor: "rgba(248, 250, 252, 0.9)",
                                }}>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.label}
                                        align={column.align}
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: "0.75rem",
                                            letterSpacing: 0.4,
                                            textTransform: "uppercase",
                                            color: "#64748b",
                                            borderBottom:
                                                "1px solid rgba(148, 163, 184, 0.3)",
                                            py: 2.5,
                                            px: 2,
                                            whiteSpace: "nowrap",
                                        }}>
                                        {renderSortableHeader(
                                            column.label,
                                            column.sortColumn
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {safeUsers.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    title={title}
                                    actionLoading={actionLoading}
                                    {...props}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};
