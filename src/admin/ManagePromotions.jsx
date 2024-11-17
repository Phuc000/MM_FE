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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const ManagePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
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
      }
    };


    fetchPromotions();
  }, []);

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
            {promotions.map((promotion) => (
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
                      Product: {promotion.product.pName}
                    </Typography>
                  )}
                  {promotion.type === 'Product Promotion' && promotion.products && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: 'wrap' }} // Enable wrapping
                    >
                      {promotion.products.map((product) => (
                        <Tooltip
                          key={product.productID || product.productId}
                          title={product.pName}
                        >
                          <Chip label={product.pName} />
                        </Tooltip>
                      ))}
                    </Stack>
                  )}
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
            ))}
            {promotions.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No promotions found.
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