// src/shipper/OrderDetailsDialog.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableContainer,
  Paper,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  DialogContentText,
  Box,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const OrderDetailsDialog = ({ 
  open, 
  onClose, 
  transactionId, 
  onOrderUpdate, 
  onOrderRemove 
}) => {
  const [transaction, setTransaction] = useState(null);
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [store, setStore] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bombConfirmation, setBombConfirmation] = useState({ open: false });

  const handleUpdateStatus = async (newStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/status/${transactionId}/${newStatus}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      // Update local state
      setTransaction(prev => ({ ...prev, deliveryStatus: newStatus }));
      onOrderUpdate(transactionId, newStatus);

      setSnackbar({
        open: true,
        message: `Delivery status updated to ${newStatus === 3 ? 'On Delivery' : 'Delivered'}.`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update delivery status.',
        severity: 'error',
      });
    }
  };

  const handleReschedule = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/status/${transactionId}/2`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      setTransaction(prev => ({ ...prev, deliveryStatus: 2 }));
      onOrderUpdate(transactionId, 2);

      setSnackbar({
        open: true,
        message: 'Order rescheduled successfully.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error rescheduling:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reschedule order.',
        severity: 'error',
      });
    }
  };

  const handleCancel = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/shippers/cancel-order/${transactionId}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      onOrderRemove(transactionId);

      setSnackbar({
        open: true,
        message: 'Order cancelled successfully.',
        severity: 'success',
      });
      onClose(); // Close dialog after cancellation
    } catch (error) {
      console.error('Error cancelling:', error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel order.',
        severity: 'error',
      });
    }
  };

  const handleBombed = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/shippers/get-bombed/${transactionId}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      onOrderRemove(transactionId);

      setSnackbar({
        open: true,
        message: 'Order marked as bombed.',
        severity: 'warning',
      });
      onClose(); // Close dialog after bombing
    } catch (error) {
      console.error('Error marking as bombed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to mark order as bombed.',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/${transactionId}`,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        setTransaction(response.data);
        
        // Fetch store details
        const storeResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/stores/${response.data.storeID}`,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        setStore(storeResponse.data);

        if (user.role === "Customer") {
          setCustomer(user);
        }
        else {
          // Fetch customer details
          const customerResponse = await axios.get(
            `${import.meta.env.VITE_REACT_APP_API_URL}/customers/${response.data.customerID}`,
            {
              headers: { 'Content-Type': 'application/json' },
              withCredentials: true,
            }
          ); 
          setCustomer(customerResponse.data);
        }
      } catch (error) {
        console.error('Error fetching transaction or customer details:', error);
      }
    };

    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: 'Quicksand',
          fontWeight: '900',
          fontSize: '2rem',
        }}
      >
        Order Details
      </DialogTitle>
      <DialogContent>
        {transaction && customer && store ? (
          <>
            <Typography variant="h6">Store Information</Typography>
            <Typography>Name: {store.name}</Typography>
            <Typography>Location: {store.location}</Typography>
            <Typography>Contact: {store.contactInfo}</Typography>
            <Typography variant="h6">Customer Information</Typography>
            <Typography>
              Name: {customer.fName} {customer.lName}
            </Typography>
            {/* <Typography>Address: {customer.address}</Typography> */}
            <Typography>Phone: {customer.phoneNumber}</Typography>
            <Typography>Email: {customer.email}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Products
            </Typography>
            <TableContainer component={Paper}>
              <Table aria-label="products table">
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transaction.includes.map((item) => (
                    <TableRow key={item.productID}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.product.description}</TableCell>
                      <TableCell>{item.numberOfProductInBill}</TableCell>
                      <TableCell>${item.product.price.toFixed(2)}</TableCell>
                      <TableCell>${item.subTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Order Summary
            </Typography>
            <Typography>Total Price: ${transaction.totalPrice.toFixed(2)}</Typography>
            <Typography>Payment Method: {transaction.paymentMethod}</Typography>
            <Typography>
              Order Date: {new Date(transaction.dateAndTime).toLocaleString()}
            </Typography>
            <Typography>
              Shipping Adress: {transaction.shippingAddress}
            </Typography>
          </>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Box>
          {transaction?.deliveryStatus === 2 && (
            <>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleUpdateStatus(3)}
                sx={{ mr: 1 }}
              >
                Set On Delivery
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCancel}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
            </>
          )}
          {transaction?.deliveryStatus === 3 && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleUpdateStatus(4)}
                sx={{ mr: 1 }}
              >
                Set Delivered
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={handleReschedule}
                sx={{ mr: 1 }}
              >
                Reschedule
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setBombConfirmation({ open: true })}
              >
                Bombed
              </Button>
            </>
          )}
        </Box>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ backgroundColor: '#fe3bd4' }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Add Bomb Confirmation Dialog */}
      <Dialog
        open={bombConfirmation.open}
        onClose={() => setBombConfirmation({ open: false })}
      >
        <DialogTitle>Confirm Order Bombing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this order as bombed? This action cannot be undone and should only be used when the customer refuses delivery.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBombConfirmation({ open: false })} color="primary">
            Cancel
          </Button>
          <Button onClick={handleBombed} color="error" variant="contained">
            Confirm Bomb
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default OrderDetailsDialog;