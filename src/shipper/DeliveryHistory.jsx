// src/admin/DeliveryHistory.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';

const DeliveryHistory = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchDeliveryHistory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/transactions`,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        const filteredDeliveries = response.data.filter(
          (transaction) => transaction.shipperID === user.id && (transaction.deliveryStatus === 4 || transaction.deliveryStatus === 6)
        );
        setDeliveries(filteredDeliveries);
      } catch (error) {
        console.error('Error fetching delivery history:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch delivery history.',
          severity: 'error',
        });
      }
    };

    if (user && user.id) {
      fetchDeliveryHistory();
    }
  }, [user]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Delivery History
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="delivery history table">
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.transactionId}>
                <TableCell>{delivery.transactionId}</TableCell>
                <TableCell>
                  {new Date(delivery.dateAndTime).toLocaleDateString()}
                </TableCell>
                <TableCell>{delivery.customerID}</TableCell>
                <TableCell>${delivery.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  {delivery.deliveryStatus === 4 ? 'Delivered' : `Status ${delivery.deliveryStatus}`}
                </TableCell>
              </TableRow>
            ))}
            {deliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No delivery history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DeliveryHistory;