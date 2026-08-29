import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const AddToCartConfirmation = ({ open, handleClose, handleConfirm, recipe, loading, error }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          px: 1,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <SmartToyIcon color="primary" />
        <Typography variant="h6" component="div">
          Use AI Smart Cart Assistant
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box mb={2}>
          <Typography variant="body1" paragraph>
            Our AI can help find and add matching ingredients for "{recipe.title}" to your cart.
            Would you like to use this feature?
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            The AI will analyze the recipe ingredients and find the best matching products in our
            store inventory.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> The AI will do its best to match ingredients, but might not
              find exact matches for all items. You'll have a chance to review your cart before
              checkout.
            </Typography>
          </Alert>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />
          }
          disabled={loading}
        >
          {loading ? "Processing..." : "Use AI Assistant"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToCartConfirmation;
