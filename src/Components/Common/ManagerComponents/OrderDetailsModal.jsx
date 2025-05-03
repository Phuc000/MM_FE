import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Chip,
  Grid
} from "@mui/material";
import axios from "axios";

const OrderDetailsModal = ({ open, onClose, orderDetails }) => {
  const [customer, setCustomer] = useState(null);
  
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (orderDetails?.customerID) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_REACT_APP_API_URL}/customers/${orderDetails.customerID}`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          setCustomer(response.data);
        } catch (error) {
          console.error("Error fetching customer details:", error);
        }
      }
    };

    fetchCustomerDetails();
  }, [orderDetails]);

  if (!orderDetails) return null;

  const getStatusChip = (status) => {
    let color = "default";
    switch (status) {
      case 0:
        color = "warning";
        break;
      case 1:
        color = "info";
        break;
      case 2:
        color = "secondary";
        break;
      case 3:
        color = "primary";
        break;
      case 4:
        color = "success";
        break;
      case 5:
        color = "error";
        break;
      default:
        color = "default";
    }

    const statusText = {
      0: "Pending",
      1: "Prepared",
      2: "Accepted",
      3: "On Delivery",
      4: "Delivered",
      5: "Cancelled",
      6: "Ghost"
    }[status] || "Unknown";

    return <Chip label={statusText} color={color} />;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Quicksand",
          fontWeight: "900",
          fontSize: "1.75rem",
          pb: 1
        }}
      >
        Order Details
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}>
                Order Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Transaction ID:</Typography>
                  <Typography variant="body2">{orderDetails.transactionId}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Date:</Typography>
                  <Typography variant="body2">{new Date(orderDetails.dateAndTime).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                  <Typography variant="body2">{orderDetails.paymentMethod}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  {getStatusChip(orderDetails.deliveryStatus)}
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}>
                Customer Information
              </Typography>
              {customer ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Name:</Typography>
                    <Typography variant="body2">{customer.fName} {customer.lName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body2">{customer.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Phone:</Typography>
                    <Typography variant="body2">{customer.phoneNumber}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Address:</Typography>
                    <Typography variant="body2" sx={{ maxWidth: '60%', textAlign: 'right' }}>
                      {orderDetails.shippingAddress || customer.address || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Loading customer details...</Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 0, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}>
            Products
          </Typography>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(254, 59, 212, 0.05)' }}>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderDetails.includes?.map((item, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight={500}>
                        {item.product?.name || item.productName}
                      </Typography>
                      {/* <Typography variant="caption" color="text.secondary">
                        {item.product?.description || ''}
                      </Typography> */}
                    </TableCell>
                    <TableCell>
                      ${item.product?.price?.toFixed(2) || (item.price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">{item.numberOfProductInBill || item.quantity}</TableCell>
                    <TableCell align="right">
                      ${item.subTotal?.toFixed(2) || 
                        ((item.product?.price || item.price || 0) * 
                        (item.numberOfProductInBill || item.quantity)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            borderTop: '1px dashed rgba(0, 0, 0, 0.12)',
            pt: 2
          }}
        >
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">Order Total:</Typography>
            <Typography variant="h6" sx={{ color: '#fe3bd4', fontWeight: 700 }}>
              ${orderDetails.totalPrice.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {/* {orderDetails.deliveryStatus === 0 && (
          <Button
            variant="contained"
            sx={{ backgroundColor: "#fe3bd4", "&:hover": { backgroundColor: "#d81cb1" } }}
            onClick={() => {
              // Call your handlePrepare function here
              onClose();
            }}
          >
            Mark as Prepared
          </Button>
        )} */}
        <Button 
          variant="outlined"
          onClick={onClose}
          sx={{ 
            borderColor: 'rgba(0, 0, 0, 0.23)',
            color: 'rgba(0, 0, 0, 0.87)',
            ml: 1
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsModal;