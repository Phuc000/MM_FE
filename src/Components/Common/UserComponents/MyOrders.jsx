import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MyOrders.scss"; // Ensure you have a corresponding SCSS file
import { useAuth } from "../../../hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  Skeleton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import OrderDetailsDialog from "../../../shipper/Components/OrderDetailsDialog";

const MyOrders = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 🔹 New: Loading state

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm')); // 🔹 True if screen is xs

  const handleOpenDialog = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTransactionId(null);
  };

  const fetchTransactions = async () => {
    try {
      if (!user || !user.id) return;
      setIsLoading(true); // 🔹 Start loading

      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/customer/${user.id}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      let fetchedTransactions = response.data || [];

      fetchedTransactions.sort((a, b) => new Date(b.dateAndTime) - new Date(a.dateAndTime));
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false); // 🔹 End loading
    }
  };

  const deliveryStatusMap = {
    0: "Pending", 1: "Prepared", 2: "Accepted", 3: "On Delivery",
    4: "Delivered", 5: "Cancelled", 6: "Ghost"
  };

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  return (
    <div className="my-orders">
      <Typography variant="h4" gutterBottom>
        Your Orders
      </Typography>

      {/* 🔹 Show Skeleton while loading */}
      {isLoading ? (
        [...Array(3)].map((_, i) => (
          <Box key={i} mb={2} p={2} borderRadius={2} boxShadow={1}>
            <Skeleton width="40%" />
            <Skeleton width="30%" />
            <Skeleton width="60%" />
            <Skeleton width="50%" />
          </Box>
        ))
      ) : transactions.length > 0 ? (
        <>
          {/* 🔸 TABLE view on medium+ screens */}
          {!isXs ? (
            <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
              <Table aria-label="orders table">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Order ID</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((order) => (
                    <TableRow key={order.transactionId}>
                      <TableCell>#{order.transactionId}</TableCell>
                      <TableCell>{new Date(order.dateAndTime).toLocaleDateString()}</TableCell>
                      <TableCell>{deliveryStatusMap[order.deliveryStatus] || "Unknown"}</TableCell>
                      <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="text" color="primary" onClick={() => handleOpenDialog(order.transactionId)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            // 🔸 CARD view on small screens
            <Box display="flex" flexDirection="column" gap={2}>
              {transactions.map((order) => (
                <Box key={order.transactionId} p={2} boxShadow={2} borderRadius={2} component={Paper}>
                  <Typography><strong>Order ID:</strong> #{order.transactionId}</Typography>
                  <Typography><strong>Date:</strong> {new Date(order.dateAndTime).toLocaleDateString()}</Typography>
                  <Typography><strong>Status:</strong> {deliveryStatusMap[order.deliveryStatus]}</Typography>
                  <Typography><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</Typography>
                  <Box mt={1}>
                    <Button variant="outlined" size="small" onClick={() => handleOpenDialog(order.transactionId)}>
                      View Details
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Dialog for order details */}
          <OrderDetailsDialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            transactionId={selectedTransactionId}
          />
        </>
      ) : (
        <Typography>No transactions available.</Typography>
      )}
    </div>
  );
};

export default MyOrders;
