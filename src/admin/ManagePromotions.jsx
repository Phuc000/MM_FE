// src/admin/ManagePromotions.jsx
import React, { useState, useEffect } from "react";
import AddPromotionDialog from "./AdminComponent/AddPromotionDialog";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  useMediaQuery,
  CardActions,
  Card,
  CardContent,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import axios from "axios";

const ManagePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProductList, setSelectedProductList] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchPromotions = async () => {
    setLoading(true); // Set loading to true when fetch starts
    try {
      const [billPromotionsRes, customerPromotionsRes, productPromotionsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/promotions/bill`),
        axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer`),
        axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/promotions/product`),
      ]);

      const billPromotions = billPromotionsRes.data;
      const customerPromotions = customerPromotionsRes.data;
      const productPromotions = productPromotionsRes.data;

      const formattedBillPromotions = billPromotions.map((promo) => ({
        ...promo,
        type: "Bill Promotion",
      }));
      const formattedCustomerPromotions = customerPromotions.map((promo) => ({
        ...promo,
        type: "Customer Promotion",
      }));
      const formattedProductPromotions = productPromotions.map((promo) => ({
        ...promo,
        type: "Product Promotion",
      }));

      setPromotions([
        ...formattedBillPromotions,
        ...formattedCustomerPromotions,
        ...formattedProductPromotions,
      ]);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false); // Set loading to false when fetch completes
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Handler for opening product list dropdown
  const handleProductListClick = (event, products) => {
    setAnchorEl(event.currentTarget);
    setSelectedProductList(products);
  };

  // Handler for closing product list dropdown
  const handleProductListClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? "product-list-popover" : undefined;

  const handleAddPromotion = () => {
    setOpenAddDialog(true);
  };

  const handleSavePromotion = async (newPromotion) => {
    try {
      let endpoint = "";
      let requestBody = {
        discount: parseFloat(newPromotion.discount),
        name: newPromotion.name,
        description: newPromotion.description,
        startDay: new Date(newPromotion.startDay).toISOString(),
        endDay: new Date(newPromotion.endDay).toISOString(),
      };

      switch (newPromotion.type) {
        case "BillPromotion":
          endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/bill`;
          requestBody.applyPrice = parseFloat(newPromotion.specificFields.applyPrice);
          requestBody.promotionChance = parseFloat(newPromotion.specificFields.promotionChance);
          break;
        case "CustomerPromotion":
          endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer`;
          requestBody.productId = newPromotion.specificFields.productId;
          break;
        case "ProductPromotion":
          endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/product`;
          requestBody.productIdList = newPromotion.specificFields.productIds;
          break;
        default:
          throw new Error("Invalid promotion type");
      }

      console.log("Saving promotion:", requestBody);
      const response = await axios.post(endpoint, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log("PRev promotions", promotions);
      console.log("Response data", response.data);
      response.data.type =
        newPromotion.type === "BillPromotion"
          ? "Bill Promotion"
          : newPromotion.type === "CustomerPromotion"
            ? "Customer Promotion"
            : "Product Promotion";

      setPromotions((prev) => [...prev, response.data]);
      toast.success("Promotion added successfully");
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast.error("Failed to add promotion");
    }
  };

  const handleDeletePromotion = async (type, promotionId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/${type}/${promotionId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      setPromotions((prev) =>
        prev.filter(
          (promo) => (promo.promotionId || promo.promotionID || promo.id) !== promotionId,
        ),
      );
      toast.success("Promotion deleted successfully");
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Failed to delete promotion");
    }
  };

  const handleDeleteExpiredPromotion = async () => {
    try {
      // Delete the expired promotion
      await axios.delete(`${import.meta.env.VITE_REACT_APP_API_URL}/promotions`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      // Fetch updated promotions
      fetchPromotions();

      toast.success("Promotion deleted successfully");
    } catch (error) {
      console.error("Error deleting or fetching promotions:", error);
      toast.error("Failed to delete promotion or fetch updated list");
    }
  };

  // Render product list - decides whether to show chips or dropdown button
  const renderProductList = (promotion) => {
    if (!promotion.products) return null;

    const productCount = promotion.products.length;
    const hasMoreProducts = productCount > 0;

    return (
      <Box>
        {hasMoreProducts && (
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => handleProductListClick(e, promotion.products)}
            endIcon={<ExpandMoreIcon />}
            sx={{
              mt: 1,
              fontSize: "0.75rem",
              textTransform: "none",
              borderColor: "rgba(0, 0, 0, 0.23)",
              color: "rgba(0, 0, 0, 0.87)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            View {productCount} product{productCount !== 1 ? "s" : ""}
          </Button>
        )}

        <Popover
          id={popoverId}
          open={open}
          anchorEl={anchorEl}
          onClose={handleProductListClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          PaperProps={{
            sx: {
              maxHeight: 300,
              width: 250,
              boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            },
          }}
        >
          <List dense>
            {selectedProductList.map((product) => (
              <ListItem key={product.productID || product.productId}>
                <ListItemText primary={product.name} />
              </ListItem>
            ))}
          </List>
        </Popover>
      </Box>
    );
  };

  // Skeleton component for loading state
  const PromotionSkeletons = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return Array(5)
      .fill(0)
      .map((_, index) =>
        isMobile ? (
          <Box key={`skeleton-${index}`} sx={{ mb: 2, mx: { xs: 1, sm: 0 } }}>
            <Skeleton
              animation="wave"
              variant="rectangular"
              height={200}
              sx={{ borderRadius: "4px" }}
            />
            <Skeleton animation="wave" width="60%" height={20} sx={{ mt: 1, mx: "auto" }} />
            <Skeleton animation="wave" width="40%" height={20} sx={{ mt: 1, mx: "auto" }} />
          </Box>
        ) : (
          <TableRow key={`skeleton-${index}`}>
            <TableCell>
              <Skeleton animation="wave" width={60} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={100} height={32} variant="rounded" />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={40} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={150} height={40} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={80} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={80} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={200} />
            </TableCell>
            <TableCell align="right">
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Skeleton animation="wave" width={32} height={32} />
              </Box>
            </TableCell>
          </TableRow>
        ),
      );
  };

  const PromotionCard = ({ promotion }) => {
    const id = promotion.promotionId || promotion.promotionID || promotion.id;

    return (
      <Card sx={{ mb: 3, mx: { xs: 1, sm: 0 } }}>
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="subtitle2" color="text.secondary">
            ID: {id}
          </Typography>
          <Typography variant="h6">{promotion.name}</Typography>
          <Chip label={promotion.type} color="primary" variant="outlined" sx={{ mt: 1 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Discount: {(promotion.discount * 100).toFixed(0)}%
          </Typography>
          {promotion.type === "Bill Promotion" && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Apply Price: ${promotion.applyPrice.toFixed(2)}
              <br />
              Chance: {promotion.promotionChance}
            </Typography>
          )}
          {promotion.type === "Customer Promotion" && promotion.product && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Product: {promotion.product.name}
            </Typography>
          )}
          {promotion.type === "Product Promotion" && renderProductList(promotion)}
          <Typography variant="body2" sx={{ mt: 1 }}>
            Start: {new Date(promotion.startDay).toLocaleDateString()}
            <br />
            End: {new Date(promotion.endDay).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {promotion.description}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <IconButton color="error" onClick={() => handleDeletePromotion(promotion.type, id)}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Promotions
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddPromotion}
        sx={{ mb: 2 }}
      >
        Add New Promotion
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<DeleteIcon />}
        onClick={handleDeleteExpiredPromotion}
        sx={{
          ml: { xs: 0, sm: 2 },
          mb: 2,
        }}
      >
        Delete Expired Promotion
      </Button>
      <AddPromotionDialog
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        handleSave={handleSavePromotion}
      />
      <TableContainer component={Paper}>
        <Table aria-label="promotions table">
          <TableHead sx={{ display: { xs: "none", sm: "table-header-group" } }}>
            <TableRow>
              <TableCell>Promotion ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <PromotionSkeletons />
            ) : promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body1" color="text.secondary">
                    No promotions found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isMobile ? (
              // Mobile: Card view
              promotions.map((promotion) => (
                <PromotionCard
                  key={promotion.promotionId || promotion.promotionID || promotion.id}
                  promotion={promotion}
                />
              ))
            ) : (
              // Desktop: Table view
              promotions.map((promotion) => (
                <TableRow key={promotion.promotionId || promotion.promotionID || promotion.id}>
                  <TableCell>
                    {promotion.promotionId || promotion.promotionID || promotion.id}
                  </TableCell>
                  <TableCell>{promotion.name}</TableCell>
                  <TableCell>
                    <Chip label={promotion.type} color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{(promotion.discount * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    {promotion.type === "Bill Promotion" && (
                      <Typography variant="body2">
                        Apply Price: ${promotion.applyPrice.toFixed(2)}
                        <br />
                        Chance: {promotion.promotionChance}
                      </Typography>
                    )}
                    {promotion.type === "Customer Promotion" && promotion.product && (
                      <Typography variant="body2">Product: {promotion.product.name}</Typography>
                    )}
                    {promotion.type === "Product Promotion" && renderProductList(promotion)}
                  </TableCell>
                  <TableCell>{new Date(promotion.startDay).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(promotion.endDay).toLocaleDateString()}</TableCell>
                  <TableCell>{promotion.description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() =>
                        handleDeletePromotion(
                          promotion.type,
                          promotion.promotionId || promotion.promotionID || promotion.id,
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ManagePromotions;
