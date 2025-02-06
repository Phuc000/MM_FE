// src/shipper/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import OrderDetailsDialog from './Components/OrderDetailsDialog';

const Dashboard = () => {
  const [shipperOrders, setShipperOrders] = useState([]);
  const [shipperInfo, setShipperInfo] = useState(null);
  const [capacityUsage, setCapacityUsage] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useAuth(); // Get the current shipper's information

  useEffect(() => {
    const fetchShipperInfo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/shippers/${user.id}`,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        setShipperInfo(response.data);
      } catch (error) {
        console.error('Error fetching shipper info:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch shipper information.',
          severity: 'error',
        });
      }
    };

    const fetchShipperOrders = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/transactions`,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );

        // Filter transactions assigned to the current shipper with status Accepted (2) or On Delivery (3)
        const filteredOrders = response.data.filter(
          (tx) =>
            tx.shipperID === user.id &&
            (tx.deliveryStatus === 2 || tx.deliveryStatus === 3)
        );

        // Calculate total weight
        const totalWeight = filteredOrders.reduce(
          (sum, tx) => sum + tx.totalWeight,
          0
        );

        setCapacityUsage(totalWeight);

        // Sort transactions by dateAndTime in descending order
        const sortedOrders = filteredOrders.sort(
          (a, b) => new Date(b.dateAndTime) - new Date(a.dateAndTime)
        );

        setShipperOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch transactions.',
          severity: 'error',
        });
      }
    };

    fetchShipperInfo();
    fetchShipperOrders();
  }, [user.id]);

  const handleOpenDetails = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDetailsDialog(false);
    setSelectedTransactionId(null);
  };

  const handleUpdateStatus = async (transactionId, newStatus) => {
    try {
      // Update delivery status
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/status/${transactionId}/${newStatus}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      // Update local state
      setShipperOrders((prev) =>
        prev.map((tx) =>
          tx.transactionId === transactionId
            ? { ...tx, deliveryStatus: newStatus }
            : tx
        )
      );

      setSnackbar({
        open: true,
        message:
          newStatus === 3
            ? 'Delivery status updated to On Delivery.'
            : 'Delivery status updated to Delivered.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating delivery status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update delivery status.',
        severity: 'error',
      });
    }
  };

  const handleReschedule = async (transactionId) => {
    try {
      // Set status back to Accepted (2)
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/status/${transactionId}/2`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      // Update local state
      setShipperOrders((prev) =>
        prev.map((tx) =>
          tx.transactionId === transactionId
            ? { ...tx, deliveryStatus: 2 }
            : tx
        )
      );

      setSnackbar({
        open: true,
        message: 'Order rescheduled successfully.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error rescheduling order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reschedule order.',
        severity: 'error',
      });
    }
  };

  const handleCancel = async (transactionId) => {
    try {
      // Cancel order using new API endpoint
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/shippers/cancel-order/${transactionId}/${user.id}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
  
      // Remove order from local state
      setShipperOrders((prev) => 
        prev.filter((tx) => tx.transactionId !== transactionId)
      );
  
      setSnackbar({
        open: true,
        message: 'Order cancelled successfully.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel order.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 2:
        return 'Accepted';
      case 3:
        return 'On Delivery';
      case 4:
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  const vehicleCapacity = shipperInfo ? shipperInfo.vehicleCapacity * 60 : 0;
  const capacityPercentage = vehicleCapacity
    ? Math.min((capacityUsage / vehicleCapacity) * 100, 100)
    : 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Shipper Dashboard
      </Typography>
      {shipperInfo && (
        <Box mb={2}>
          <Typography variant="h6">
            Vehicle Capacity Usage: {capacityUsage}g / {vehicleCapacity}g
          </Typography>
          <LinearProgress variant="determinate" value={capacityPercentage} />
        </Box>
      )}
      <TableContainer component={Paper}>
        <Table aria-label="shipper orders table">
          <TableHead>
            <TableRow>
              <TableCell>Date and Time</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Delivery Status</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Total Weight</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shipperOrders.map((tx) => (
              <TableRow key={tx.transactionId}>
                <TableCell>{new Date(tx.dateAndTime).toLocaleString()}</TableCell>
                <TableCell>{tx.paymentMethod}</TableCell>
                <TableCell>{getStatusText(tx.deliveryStatus)}</TableCell>
                <TableCell>${tx.totalPrice.toFixed(2)}</TableCell>
                <TableCell>{tx.totalWeight} g</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDetails(tx.transactionId)}
                    sx={{ marginRight: '8px' }}
                  >
                    View Details
                  </Button>
                  {tx.deliveryStatus === 2 && (
                    <>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleUpdateStatus(tx.transactionId, 3)}
                        sx={{ marginRight: '8px' }}
                      >
                        Set On Delivery
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleCancel(tx.transactionId)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {tx.deliveryStatus === 3 && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleUpdateStatus(tx.transactionId, 4)}
                        sx={{ marginRight: '8px' }}
                      >
                        Set Delivered
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleReschedule(tx.transactionId)}
                      >
                        Reschedule
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {shipperOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No current orders.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      {selectedTransactionId && (
        <OrderDetailsDialog
          open={openDetailsDialog}
          onClose={handleCloseDetails}
          transactionId={selectedTransactionId}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;