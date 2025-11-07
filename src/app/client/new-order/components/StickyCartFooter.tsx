import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface StickyCartFooterProps {
    itemCount: number;
    totalPrice: number;
    onClick: () => void;
}

export const StickyCartFooter = ({
    itemCount,
    totalPrice,
    onClick,
}: StickyCartFooterProps) => (
    <AppBar
        position="fixed"
        color="inherit"
        onClick={onClick}
        elevation={3}
        sx={{
            top: "auto",
            bottom: 0,
            borderTop: "1px solid",
            borderColor: "grey.200",
            cursor: "pointer",
        }}>
        <Toolbar
            disableGutters
            sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
            }}>
            <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ flexGrow: 1 }}>
                {itemCount} {itemCount === 1 ? "item" : "items"} -{" "}
                {`AED ${new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(totalPrice)}`}
            </Typography>
            <Button
                component="span"
                color="primary"
                endIcon={<ArrowForwardIosIcon fontSize="small" />}
                sx={{ fontWeight: 600 }}>
                View Cart
            </Button>
        </Toolbar>
    </AppBar>
);
