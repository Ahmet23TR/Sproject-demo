// src/app/admin/dashboard/components/QuickAccess.tsx
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ListAltIcon from '@mui/icons-material/ListAlt';

const QuickAccessButton = ({ href, title, icon }: { href: string, title: string, icon: React.ReactNode }) => (
    <Link href={href} style={{ textDecoration: 'none', flex: 1 }}>
        <Box bgcolor="#fff" borderRadius={3} p={3} display="flex" alignItems="center" gap={2} justifyContent="center"
            sx={{ transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px 0 rgba(39,174,96,0.16)' } }}>
            {icon}
            <Typography fontWeight={600} color="#171717">{title}</Typography>
        </Box>
    </Link>
);

export const QuickAccess = () => (
    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} mb={5}>
        <QuickAccessButton href="/admin/clients" title="Client Management" icon={<PeopleIcon sx={{ color: '#27AE60', fontSize: 28 }} />} />
        <QuickAccessButton href="/admin/staff" title="Staff Management" icon={<PeopleIcon sx={{ color: '#27AE60', fontSize: 28 }} />} />
        <QuickAccessButton href="/admin/products" title="Product Management" icon={<MenuBookIcon sx={{ color: '#27AE60', fontSize: 28 }} />} />
        <QuickAccessButton href="/admin/orders" title="Orders" icon={<ListAltIcon sx={{ color: '#27AE60', fontSize: 28 }} />} />
    </Box>
);