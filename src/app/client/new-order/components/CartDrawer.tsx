import { Drawer, Box, IconButton, Typography, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ShoppingCart } from "./ShoppingCart";

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => (
    <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
            "& .MuiDrawer-paper": {
                maxHeight: "90vh",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            },
        }}>
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0, // Important for flex children to shrink
            }}>
            {/* Fixed Header */}
            <Box
                sx={{
                    pt: 2,
                    px: 2,
                    pb: 0,
                    flexShrink: 0,
                }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.5,
                    }}>
                    <Typography variant="h6" fontWeight={700}>
                        Shopping Cart
                    </Typography>
                    <IconButton aria-label="Close cart" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />
            </Box>

            {/* Scrollable Content */}
            <Box
                sx={{
                    flex: 1,
                    overflow: "auto",
                    px: 2,
                    pt: 2,
                    pb: 3,
                    minHeight: 0, // Important for proper scrolling
                }}>
                <ShoppingCart variant="drawer" />
            </Box>
        </Box>
    </Drawer>
);
