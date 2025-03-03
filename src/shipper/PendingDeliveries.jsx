// // src/PendingDeliveries.jsx
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Typography, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

// const PendingDeliveries = () => {
//   const [pendingOrders, setPendingOrders] = useState([]);
//   const [selectedOrders, setSelectedOrders] = useState([]);
//   const [vehicleCapacity, setVehicleCapacity] = useState(0);

//   useEffect(() => {
//     // Fetch vehicle capacity
//     axios.get('/api/shipper/vehicle-capacity')
//       .then(response => setVehicleCapacity(response.data.capacity))
//       .catch(error => console.error('Error fetching vehicle capacity:', error));

//     // Fetch pending deliveries
//     axios.get('/api/shipper/pending-deliveries')
//       .then(response => setPendingOrders(response.data))
//       .catch(error => console.error('Error fetching pending deliveries:', error));
//   }, []);

//   const handleAddToDeliveries = (order) => {
//     const currentTotalWeight = selectedOrders.reduce((sum, o) => sum + o.totalWeight, 0);
//     if (currentTotalWeight + order.totalWeight <= vehicleCapacity) {
//       setSelectedOrders(prev => [...prev, order]);
//     } else {
//       alert('Cannot add order. Exceeds vehicle capacity.');
//     }
//   };

//   const handleConfirmDeliveries = () => {
//     const orderIds = selectedOrders.map(order => order.id);
//     axios.post('/api/shipper/accept-deliveries', { orderIds })
//       .then(() => {
//         // Update pending orders and reset selected orders
//         setPendingOrders(prev => prev.filter(order => !orderIds.includes(order.id)));
//         setSelectedOrders([]);
//         alert('Deliveries accepted successfully.');
//       })
//       .catch(error => console.error('Error accepting deliveries:', error));
//   };

//   return (
//     <div>
//       <Typography variant="h4" gutterBottom>
//         Pending Deliveries
//       </Typography>
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>Order ID</TableCell>
//             <TableCell>Customer</TableCell>
//             <TableCell>Total Weight</TableCell>
//             <TableCell>Action</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {pendingOrders.map(order => (
//             <TableRow key={order.id}>
//               <TableCell>{order.id}</TableCell>
//               <TableCell>{order.customerName}</TableCell>
//               <TableCell>{order.totalWeight}</TableCell>
//               <TableCell>
//                 <Button
//                   variant="contained"
//                   onClick={() => handleAddToDeliveries(order)}
//                 >
//                   Add to Deliveries
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//       {selectedOrders.length > 0 && (
//         <div>
//           <h2>Selected Orders</h2>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Order ID</TableCell>
//                 <TableCell>Total Weight</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {selectedOrders.map(order => (
//                 <TableRow key={order.id}>
//                   <TableCell>{order.id}</TableCell>
//                   <TableCell>{order.totalWeight}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleConfirmDeliveries}
//           >
//             Confirm Deliveries
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PendingDeliveries;

// src/shipper/PendingDeliveries.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Snackbar,
  Alert,
  Box,
  TableContainer,
  Paper,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const PendingDeliveries = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useAuth(); // Get the shipper's user info

  useEffect(() => {
    const fetchPendingTransactions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/transactions/status/1`, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
        // Filter transactions with deliveryStatus === 1 (Prepared)
        const preparedTransactions = response.data.filter(
          (tx) => tx.deliveryStatus === 1
        );
        setPendingTransactions(preparedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch transactions.',
          severity: 'error',
        });
      }
    };

    fetchPendingTransactions();
  }, []);

  const handleAcceptDelivery = async (transactionId) => {
    try {
      // Update delivery status to Accepted (2)
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/status/${transactionId}/2`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      // Assign shipper ID to the transaction
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/${transactionId}/${user.id}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      // Remove the accepted transaction from the list
      setPendingTransactions((prev) =>
        prev.filter((tx) => tx.transactionId !== transactionId)
      );

      setSnackbar({
        open: true,
        message: 'Delivery accepted successfully.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error accepting delivery:', error);
      setSnackbar({
        open: true,
        message: 'Failed to accept delivery.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pending Deliveries
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="pending deliveries table">
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Store ID</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Date and Time</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Total Weight</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingTransactions.map((tx) => (
              <TableRow key={tx.transactionId}>
                <TableCell>{tx.transactionId}</TableCell>
                <TableCell>{tx.customerID}</TableCell>
                <TableCell>{tx.storeID}</TableCell>
                <TableCell>{tx.paymentMethod}</TableCell>
                <TableCell>{new Date(tx.dateAndTime).toLocaleString()}</TableCell>
                <TableCell>${tx.totalPrice.toFixed(2)}</TableCell>
                <TableCell>{tx.totalWeight} g</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAcceptDelivery(tx.transactionId)}
                  >
                    Accept Delivery
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pendingTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No pending deliveries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

export default PendingDeliveries;