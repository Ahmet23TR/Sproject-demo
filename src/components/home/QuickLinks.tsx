import { Grid, Card, Typography } from '@mui/material';
import Link from 'next/link';

interface QuickLink {
    label: string;
    href: string;
}

export const QuickLinks = ({ links }: { links: QuickLink[] }) => (
    <Grid container spacing={2} justifyContent="center" mb={6}>
        {links.map((link) => (
            <Grid key={link.href}>
                <Link href={link.href} passHref style={{ textDecoration: 'none' }}>
                    <Card sx={{ p: 2, textAlign: 'center', minWidth: 200, transition: '0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
                        <Typography variant="h6" fontWeight={600}>{link.label}</Typography>
                    </Card>
                </Link>
            </Grid>
        ))}
    </Grid>
);