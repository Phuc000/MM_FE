
// src/shipper/PendingDeliveries.jsx
import { useEffect, useState } from 'react';
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
  Skeleton,
  TableContainer,
  Paper,
  Pagination,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css'; // Import your CSS file for styling

const PendingDeliveries = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useAuth(); // Get the shipper's user info
  const [isLoading, setIsLoading] = useState(true); // Loading state  

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const itemsPerPage = isXs ? 5 : 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPendingTransactions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/transactions/status/1`, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
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
      } finally {
        setIsLoading(false);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Calculate the data to display based on pagination
  const paginatedTransactions = pendingTransactions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Calculate total number of pages
  const totalPages = Math.ceil(pendingTransactions.length / itemsPerPage);

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        Pending Deliveries
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          boxShadow: '2px 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
        }}
      >
        <Table aria-label="pending deliveries table">
          <TableHead
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              display: { xs: 'none', sm: 'table-header-group' },
            }}
          >
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Store ID</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Date and Time</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {Array.from({ length: 8 }).map((__, i) => (
                    <TableCell key={i}>
                      <Skeleton variant="text" width="100%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {paginatedTransactions.map((tx) => (
                  <TableRow
                    key={tx.transactionId}
                    sx={{
                      display: { xs: 'block', sm: 'table-row' },
                      marginBottom: { xs: 2, sm: 0 },
                      border: { xs: '1px solid #ccc', sm: 'none' },
                      borderRadius: { xs: 2, sm: 0 },
                      padding: { xs: 2, sm: 0}
                    }}
                  >
                    <TableCell
                      sx={{ display: { xs: 'flex', sm: 'table-cell' }, justifyContent: 'space-between' }}
                    >
                      <strong className="shipperTableItem">Transaction ID:</strong>
                      {tx.transactionId}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'flex', sm: 'table-cell' }, justifyContent: 'space-between' }}
                    >
                      <strong className="shipperTableItem">Customer ID:</strong>
                      {tx.customerID}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'flex', sm: 'table-cell' }, justifyContent: 'space-between' }}
                    >
                      <strong className="shipperTableItem">Store ID:</strong>
                      {tx.storeID}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'flex', sm: 'table-cell' }, justifyContent: 'space-between' }}
                    >
                      <strong className="shipperTableItem">Payment Method:</strong>
                      {tx.paymentMethod}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'flex', sm: 'table-cell' }, justifyContent: 'space-between' }}
                    >
                      <strong className="shipperTableItem">Date and Time:</strong>
                      {new Date(tx.dateAndTime).toLocaleString()}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'flex', sm: 'table-cell' }, justifyContent: 'space-between' }}
                    >
                      <strong className="shipperTableItem">Total Price:</strong>
                      ${tx.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'flex', sm: 'table-cell' }, justifyContent: 'space-between' }}
                    >
                      <strong className="shipperTableItem">Action:</strong>
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
                {paginatedTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No pending deliveries found.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pendingTransactions.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            size={isXs ? 'small' : 'medium'}
          />
        </Box>
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

export default PendingDeliveries;