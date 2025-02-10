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
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
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

  const [routingData, setRoutingData] = useState(null);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);

  const [bombConfirmation, setBombConfirmation] = useState({ open: false, transactionId: null });

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
        `${import.meta.env.VITE_REACT_APP_API_URL}/shippers/cancel-order/${transactionId}`,
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

  // Add confirmation handler
  const handleBombConfirmOpen = (transactionId) => {
    setBombConfirmation({ open: true, transactionId });
  };

  const handleBombConfirmClose = () => {
    setBombConfirmation({ open: false, transactionId: null });
  };

  const handleBombed = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/shippers/get-bombed/${bombConfirmation.transactionId}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      setShipperOrders((prev) => 
        prev.filter((tx) => tx.transactionId !== bombConfirmation.transactionId)
      );

      setSnackbar({
        open: true,
        message: 'Order marked as bombed.',
        severity: 'warning',
      });
    } catch (error) {
      console.error('Error marking order as bombed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to mark order as bombed.',
        severity: 'error',
      });
    } finally {
      handleBombConfirmClose();
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

  const handleOrderUpdate = (transactionId, newStatus) => {
    setShipperOrders(prev =>
      prev.map(tx =>
        tx.transactionId === transactionId
          ? { ...tx, deliveryStatus: newStatus }
          : tx
      )
    );
  };
  
  const handleOrderRemove = (transactionId) => {
    setShipperOrders(prev => 
      prev.filter(tx => tx.transactionId !== transactionId)
    );
  };
  

  const handleGenerateRoute = async () => {
    setIsGeneratingRoute(true);
    try {
      // Group orders by store
      const ordersByStore = shipperOrders.reduce((acc, order) => {
        if (!acc[order.storeID]) {
          acc[order.storeID] = {
            storeAddress: '', // Will be fetched
            orders: []
          };
        }
        acc[order.storeID].orders.push(order);
        return acc;
      }, {});
  
      // Fetch store addresses and generate routes
      const routeResults = [];
      for (const storeId of Object.keys(ordersByStore)) {
        // Fetch store info
        const storeResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/stores/${storeId}`,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        
        const shopAddress = storeResponse.data.location;
        const deliveryAddresses = ordersByStore[storeId].orders.map(
          order => order.shippingAddress
        );
  
        // Get optimal route
        const routeResponse = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/delivery/optimize`,
          {
            shopAddress,
            deliveryAddresses
          },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
  
        routeResults.push({
          storeId,
          storeName: storeResponse.data.name,
          route: routeResponse.data.optimalRoute,
          distance: routeResponse.data.totalDistance,
          orders: ordersByStore[storeId].orders // Include orders in route data
        });
      }
  
      setRoutingData(routeResults);
      setSnackbar({
        open: true,
        message: 'Route generated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating route:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate route',
        severity: 'error'
      });
    } finally {
      setIsGeneratingRoute(false);
    }
  };
  
  const RouteTable = ({ routingData }) => {
    if (!routingData) return null;

    const getOrderByAddress = (storeRoute, address) => {
      return storeRoute.orders?.find(order => order.shippingAddress === address);
    };
  
    const createGoogleMapsLink = (from, to) => {
      const encodedFrom = encodeURIComponent(from);
      const encodedTo = encodeURIComponent(to);
      return `https://www.google.com/maps/dir/${encodedFrom}/${encodedTo}`;
    };

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Delivery Routes
        </Typography>
        {routingData.map((storeRoute) => (
          <Box key={storeRoute.storeId} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              {storeRoute.storeName} - Total Distance: {(storeRoute.distance / 1000).toFixed(2)} km
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Step</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {storeRoute.route.map((address, index) => (
                    index < storeRoute.route.length - 1 && (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{address}</TableCell>
                        <TableCell>{storeRoute.route[index + 1]}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="primary"
                            href={createGoogleMapsLink(address, storeRoute.route[index + 1])}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ marginRight: '8px' }}
                          >
                            View on Maps
                          </Button>
                          {getOrderByAddress(storeRoute, storeRoute.route[index + 1]) && (
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => handleOpenDetails(
                                getOrderByAddress(storeRoute, storeRoute.route[index + 1]).transactionId
                              )}
                            >
                              View Order
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Box>
    );
  };

  const vehicleCapacity = shipperInfo ? shipperInfo.vehicleCapacity : 0;
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
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerateRoute}
        disabled={isGeneratingRoute || shipperOrders.length === 0}
        sx={{ mt: 2 }}
      >
        {isGeneratingRoute ? 'Generating Route...' : 'Create Route'}
      </Button>

      <RouteTable routingData={routingData} />
      <TableContainer component={Paper}>
        <Table aria-label="shipper orders table">
          <TableHead
            sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
          >
            <TableRow>
              <TableCell>Date and Time</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Delivery Status</TableCell>
              <TableCell>Store ID</TableCell>
              <TableCell>Shipping Address</TableCell>
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
                <TableCell>{tx.storeID}</TableCell>
                <TableCell>{tx.shippingAddress}</TableCell>
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
                        sx={{ marginRight: '8px' }}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleBombConfirmOpen(tx.transactionId)}
                      >
                        Bombed
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
          onOrderUpdate={handleOrderUpdate}
          onOrderRemove={handleOrderRemove}
        />
      )}

      <Dialog
        open={bombConfirmation.open}
        onClose={handleBombConfirmClose}
      >
        <DialogTitle>Confirm Order Bombing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this order as bombed? This action cannot be undone and should only be used when the customer refuses delivery.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBombConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleBombed} color="error" variant="contained">
            Confirm Bomb
          </Button>
        </DialogActions>
      </Dialog>

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