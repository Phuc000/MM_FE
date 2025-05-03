// src/admin/ManagePromotions.jsx
import React, { useState, useEffect } from 'react';
import AddPromotionDialog from './AdminComponent/AddPromotionDialog';
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
  Stack,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Skeleton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const ManagePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProductList, setSelectedProductList] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
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
          type: 'Bill Promotion',
        }));
        const formattedCustomerPromotions = customerPromotions.map((promo) => ({
          ...promo,
          type: 'Customer Promotion',
        }));
        const formattedProductPromotions = productPromotions.map((promo) => ({
          ...promo,
          type: 'Product Promotion',
        }));

        setPromotions([
          ...formattedBillPromotions,
          ...formattedCustomerPromotions,
          ...formattedProductPromotions,
        ]);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        toast.error('Failed to load promotions');
      } finally {
        setLoading(false); // Set loading to false when fetch completes
      }
    };

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
  const popoverId = open ? 'product-list-popover' : undefined;

  const handleAddPromotion = () => {
    setOpenAddDialog(true);
  };

  const handleSavePromotion = async (newPromotion) => {
    try {
      let endpoint = '';
      let requestBody = {
        discount: parseFloat(newPromotion.discount),
        name: newPromotion.name,
        description: newPromotion.description,
        startDay: new Date(newPromotion.startDay).toISOString(),
        endDay: new Date(newPromotion.endDay).toISOString(),
      };

      switch (newPromotion.type) {
        case 'BillPromotion':
          endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/bill`;
          requestBody.applyPrice = parseFloat(newPromotion.specificFields.applyPrice);
          requestBody.promotionChance = parseFloat(newPromotion.specificFields.promotionChance);
          break;
        case 'CustomerPromotion':
          endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer`;
          requestBody.productId = newPromotion.specificFields.productId;
          break;
        case 'ProductPromotion':
          endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/product`;
          requestBody.productIdList = newPromotion.specificFields.productIds;
          break;
        default:
          throw new Error('Invalid promotion type');
      }

      console.log('Saving promotion:', requestBody);
      await axios.post(endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      setPromotions((prev) => [...prev, newPromotion]);
      toast.success('Promotion added successfully');
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Failed to add promotion');
    }
  };

  const handleEditPromotion = (promotionId) => {
    // Handle editing promotion
    console.log('Edit promotion:', promotionId);
  };

  const handleDeletePromotion = async (promotionId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_APP_API_URL}/promotions/${promotionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      setPromotions((prev) => prev.filter((promo) => promo.id !== promotionId));
      toast.success('Promotion deleted successfully');
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
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
              fontSize: '0.75rem',
              textTransform: 'none',
              borderColor: 'rgba(0, 0, 0, 0.23)',
              color: 'rgba(0, 0, 0, 0.87)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            View {productCount} product{productCount !== 1 ? 's' : ''}
          </Button>
        )}
        
        <Popover
          id={popoverId}
          open={open}
          anchorEl={anchorEl}
          onClose={handleProductListClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              maxHeight: 300,
              width: 250,
              boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px'
            }
          }}
        >
          <List dense>
            {selectedProductList.map((product) => (
              <ListItem key={product.productID || product.productId}>
                <ListItemText 
                  primary={product.name} 
                  // secondary={product.description && product.description.length > 30 
                  //   ? `${product.description.substring(0, 30)}...` 
                  //   : product.description}
                />
              </ListItem>
            ))}
          </List>
        </Popover>
      </Box>
    );
  };

  // Skeleton component for loading state
  const PromotionSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton animation="wave" width={60} /></TableCell>
        <TableCell><Skeleton animation="wave" width={120} /></TableCell>
        <TableCell><Skeleton animation="wave" width={100} height={32} variant="rounded" /></TableCell>
        <TableCell><Skeleton animation="wave" width={40} /></TableCell>
        <TableCell><Skeleton animation="wave" width={150} height={40} /></TableCell>
        <TableCell><Skeleton animation="wave" width={80} /></TableCell>
        <TableCell><Skeleton animation="wave" width={80} /></TableCell>
        <TableCell><Skeleton animation="wave" width={200} /></TableCell>
        <TableCell align="right">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Skeleton animation="wave" width={32} height={32} sx={{ mr: 1 }} />
            <Skeleton animation="wave" width={32} height={32} />
          </Box>
        </TableCell>
      </TableRow>
    ));
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
      <AddPromotionDialog
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        handleSave={handleSavePromotion}
      />
      <TableContainer component={Paper}>
        <Table aria-label="promotions table">
          <TableHead>
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
            ) : promotions.length > 0 ? (
              promotions.map((promotion) => (
                <TableRow
                  key={
                    promotion.promotionId ||
                    promotion.promotionID ||
                    promotion.id
                  }
                >
                  <TableCell>
                    {promotion.promotionId ||
                      promotion.promotionID ||
                      promotion.id}
                  </TableCell>
                  <TableCell>{promotion.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={promotion.type}
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{(promotion.discount * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    {promotion.type === 'Bill Promotion' && (
                      <Typography variant="body2">
                        Apply Price: ${promotion.applyPrice.toFixed(2)}
                        <br />
                        Chance: {promotion.promotionChance}
                      </Typography>
                    )}
                    {promotion.type === 'Customer Promotion' && promotion.product && (
                      <Typography variant="body2">
                        Product: {promotion.product.name}
                      </Typography>
                    )}
                    {promotion.type === 'Product Promotion' && renderProductList(promotion)}
                  </TableCell>
                  <TableCell>
                    {new Date(promotion.startDay).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(promotion.endDay).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{promotion.description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        handleEditPromotion(
                          promotion.promotionId ||
                            promotion.promotionID ||
                            promotion.id
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() =>
                        handleDeletePromotion(
                          promotion.promotionId ||
                            promotion.promotionID ||
                            promotion.id
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body1" color="text.secondary">
                    No promotions found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ManagePromotions;