import { Box, Typography } from '@mui/material';
import type { User } from '../../types/data';

interface WelcomeHeaderProps {
    user: User | null;
}

export const WelcomeHeader = ({ user }: WelcomeHeaderProps) => {
    const title = user ? `Welcome, ${user.name}!` : "Deras Order Platform";
    const subtitle = user
        ? user.role === "ADMIN"
            ? "Easily manage all operations from the admin panel."
            : "Easily create and track your orders."
        : "Login or register to manage your orders.";

    return (
        <Box display="flex" flexDirection="column" alignItems="center" mb={6} textAlign="center">
            <Typography variant="h4" fontWeight={700} gutterBottom>{title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" maxWidth={500}>{subtitle}</Typography>
        </Box>
    );
};