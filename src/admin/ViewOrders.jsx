// src/admin/ViewOrders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import OrderDetailsDialog from "./AdminComponent/OrderDetailsDialog";
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
  Select,
  MenuItem,
  TablePagination, // Import TablePagination
} from "@mui/material";

const ViewOrders = () => {
  const [transactions, setTransactions] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filterStatus, setFilterStatus] = useState("");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const deliveryStatuses = [
    { value: 0, label: "Pending" },
    { value: 1, label: "Prepared" },
    { value: 2, label: "Accepted" },
    { value: 3, label: "On Delivery" },
    { value: 4, label: "Delivered" },
  ];

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]); // Removed fetchTransactions from dependencies

  const fetchTransactions = async () => {
    try {
      let endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/transactions`;
      if (filterStatus !== "") {
        endpoint += `?status=${Number(filterStatus)}`; // Ensure status is a number
      }
      const response = await axios.get(endpoint, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      // Sort transactions by dateAndTime in descending order
      const sortedTransactions = response.data.sort(
        (a, b) => new Date(b.dateAndTime) - new Date(a.dateAndTime),
      );
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch transactions.",
        severity: "error",
      });
    }
  };

  const handleViewOrder = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setOpenDetailsDialog(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusText = (status) => {
    const statusObj = deliveryStatuses.find((item) => item.value === status);
    return statusObj ? statusObj.label : "Unknown";
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value === "" ? "" : Number(value)); // Convert to number
    setPage(0); // Reset to first page when filter changes
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  // Transactions to display on the current page
  const displayedTransactions = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 900,
          fontFamily: "Quicksand, sans-serif",
          color: "#fe3bd4",
        }}
      >
        View Orders
      </Typography>
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <Select value={filterStatus} displayEmpty onChange={handleStatusChange}>
          <MenuItem value="">
            <em>All Statuses</em>
          </MenuItem>
          {deliveryStatuses.map((status) => (
            <MenuItem key={status.value} value={status.value}>
              {status.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
            {displayedTransactions.map((tx) => (
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewOrder(tx.transactionId)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {displayedTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={transactions.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Order Details Dialog */}
      {selectedTransactionId && (
        <OrderDetailsDialog
          open={openDetailsDialog}
          handleClose={() => {
            setOpenDetailsDialog(false);
            setSelectedTransactionId(null);
          }}
          transactionId={selectedTransactionId}
        />
      )}

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

export default ViewOrders;
