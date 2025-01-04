// src/admin/StoreOrders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import "./StoreOrders.scss";

const StoreOrders = () => {
  const [transactions, setTransactions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/transactions`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        // Sort transactions by dateAndTime in descending order
        const sortedTransactions = response.data.sort(
          (a, b) => new Date(b.dateAndTime) - new Date(a.dateAndTime)
        );
        setTransactions(sortedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setSnackbar({ open: true, message: "Failed to fetch transactions.", severity: "error" });
      }
    };

    fetchTransactions();
  }, []);

  const handlePrepare = async (transactionId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/status/${transactionId}/1`,
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.transactionId === transactionId ? { ...tx, deliveryStatus: 1 } : tx
        )
      );
      setSnackbar({ open: true, message: "Transaction status updated to Prepared.", severity: "success" });
    } catch (error) {
      console.error("Error updating transaction status:", error);
      setSnackbar({ open: true, message: "Failed to update transaction status.", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Prepared";
      case 2:
        return "Accepted";
      case 3:
        return "On Delivery";
      case 4:
        return "Delivered";
      default:
        return "Unknown";
    }
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter === "All") return true;
    return getStatusText(tx.deliveryStatus) === statusFilter;
  });

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "900",
          fontFamily: "Quicksand",
        }}
      >
        Store Orders
      </Typography>

      {/* Status Filter */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Filter by Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusChange}
            label="Filter by Status"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Prepared">Prepared</MenuItem>
            <MenuItem value="Accepted">Accepted</MenuItem>
            <MenuItem value="On Delivery">On Delivery</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="transactions table">
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Store ID</TableCell>
              <TableCell>Shipper ID</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Date and Time</TableCell>
              <TableCell>Delivery Status</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Total Weight</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx.transactionId}>
                <TableCell>{tx.transactionId}</TableCell>
                <TableCell>{tx.customerID}</TableCell>
                <TableCell>{tx.storeID}</TableCell>
                <TableCell>
                  {tx.shipperID === "00000000-0000-0000-0000-000000000000" ? "N/A" : tx.shipperID}
                </TableCell>
                <TableCell>{tx.paymentMethod}</TableCell>
                <TableCell>{new Date(tx.dateAndTime).toLocaleString()}</TableCell>
                <TableCell>{getStatusText(tx.deliveryStatus)}</TableCell>
                <TableCell>${tx.totalPrice.toFixed(2)}</TableCell>
                <TableCell>{tx.totalWeight} g</TableCell>
                <TableCell align="center">
                  {tx.deliveryStatus === 0 && (
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "#fe3bd4", color: "white" }}
                      onClick={() => handlePrepare(tx.transactionId)}
                    >
                      Prepare
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No transactions found for the selected status.
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StoreOrders;