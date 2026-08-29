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
  Skeleton,
  Chip,
  Tooltip,
  useMediaQuery,
  Pagination,
  Card,
  CardContent,
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import OrderDetailsModal from "./OrderDetailsModal";
import "./StoreOrders.scss";
// Import icons for status chips
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import PaymentIcon from "@mui/icons-material/Payment";

import CancelIcon from "@mui/icons-material/Cancel";

const StoreOrders = () => {
  // Keep existing state and hooks
  const [transactions, setTransactions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const user = useAuth().user;

  const isMobile = useMediaQuery("(max-width:600px)");
  const itemsPerPage = isMobile ? 5 : 10;
  const [page, setPage] = useState(1);

  // Keep existing useEffects and functions as they are
  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/employees/${user.id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        );
        const employeeData = response.data;
        setStoreId(employeeData.storeID);
        console.log("Store ID:", employeeData.storeID); // Log the store ID for debugging
      } catch (error) {
        console.error(`Error fetching employee ${user.id} data:`, error);
      }
    };

    if (user && user.id) {
      fetchEmployeeInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/store/${storeId}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        );
        // Sort transactions by dateAndTime in descending order
        const sortedTransactions = response.data.sort(
          (a, b) => new Date(b.dateAndTime) - new Date(a.dateAndTime),
        );
        setTransactions(sortedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setSnackbar({ open: true, message: "Failed to fetch transactions.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchTransactions();
    }
  }, [storeId]);

  const handlePrepare = async (transactionId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/status/${transactionId}/1`,
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      setTransactions((prev) =>
        prev.map((tx) => (tx.transactionId === transactionId ? { ...tx, deliveryStatus: 1 } : tx)),
      );
      setSnackbar({
        open: true,
        message: "Transaction status updated to Prepared.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating transaction status:", error);
      setSnackbar({
        open: true,
        message: "Failed to update transaction status.",
        severity: "error",
      });
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
      case 5:
        return "Cancelled";
      case 6:
        return "Ghost";
      default:
        return "Unknown";
    }
  };

  // Add a function to format transaction IDs
  const formatTransactionId = (id) => {
    if (!id) return "";
    // Show only the first 4 and last 4 characters for better readability
    return id.length > 10 ? `#${id.substring(0, 4)}...${id.substring(id.length - 4)}` : `#${id}`;
  };

  // Add a function to get status chips
  const getStatusChip = (status) => {
    let color, icon, label;

    switch (status) {
      case 0:
        color = "warning";
        icon = <AccessTimeIcon fontSize="small" />;
        label = "Pending";
        break;
      case 1:
        color = "info";
        icon = <CheckCircleIcon fontSize="small" />;
        label = "Prepared";
        break;
      case 2:
        color = "secondary";
        icon = <PersonIcon fontSize="small" />;
        label = "Accepted";
        break;
      case 3:
        color = "primary";
        icon = <LocalShippingIcon fontSize="small" />;
        label = "On Delivery";
        break;
      case 4:
        color = "success";
        icon = <CheckCircleIcon fontSize="small" />;
        label = "Delivered";
        break;
      case 5:
        color = "error";
        icon = <CancelIcon fontSize="small" />;
        label = "Cancelled";
        break;
      case 6:
        color = "default";
        icon = <InfoIcon fontSize="small" />;
        label = "Ghost";
        break;
      default:
        color = "default";
        label = "Unknown";
    }

    return (
      <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  // Format date in a more readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleOpenModal = (transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTransaction(null);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter === "All") return true;
    return getStatusText(tx.deliveryStatus) === statusFilter;
  });

  const paginatedData = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleChangePage = (_, value) => {
    setPage(value);
  };

  return (
    <Box mr={2}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "900", fontFamily: "Quicksand", mb: 1 }}
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

      {loading ? (
        Array.from(new Array(itemsPerPage)).map((_, index) =>
          isMobile ? (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="90%" />
              </CardContent>
            </Card>
          ) : (
            <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
          ),
        )
      ) : paginatedData.length > 0 ? (
        isMobile ? (
          paginatedData.map((tx) => (
            <Card key={tx.transactionId} sx={{ mb: 2 }} onClick={() => handleOpenModal(tx)}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Order: {formatTransactionId(tx.transactionId)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  <strong>Customer:</strong> {tx.customerID}
                </Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  <strong>Date:</strong> {formatDate(tx.dateAndTime)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  <strong>Status:</strong> {getStatusChip(tx.deliveryStatus)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  <strong>Payment:</strong> {tx.paymentMethod}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "#fe3bd4" }}>
                  <strong>Total:</strong> ${tx.totalPrice.toFixed(2)}
                </Typography>
                <TableCell
                  align="center"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    borderBottom: "none", // <-- remove bottom border
                    boxShadow: "none", // <-- ensure no shadow
                    paddingBottom: 0, // <-- remove padding
                  }}
                >
                  {tx.deliveryStatus === 0 && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: "#fe3bd4",
                        color: "white",
                        "&:hover": { backgroundColor: "#d81cb1" },
                        mr: 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrepare(tx.transactionId);
                      }}
                    >
                      Prepare
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: "rgba(0, 0, 0, 0.23)", color: "rgba(0, 0, 0, 0.87)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(tx);
                    }}
                  >
                    Details
                  </Button>
                </TableCell>
              </CardContent>
            </Card>
          ))
        ) : (
          <TableContainer
            component={Paper}
            elevation={1}
            sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", mb: 3 }}
          >
            <Table aria-label="transactions table">
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(254, 59, 212, 0.05)" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Total
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((tx) => (
                  <TableRow
                    key={tx.transactionId}
                    sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.03)" }, cursor: "pointer" }}
                    onClick={() => handleOpenModal(tx)}
                  >
                    <TableCell>
                      <Tooltip title={tx.transactionId} placement="top">
                        <Typography variant="body2" fontWeight={600} sx={{ color: "#333" }}>
                          {formatTransactionId(tx.transactionId)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="body2">{tx.customerID}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(tx.dateAndTime)}</TableCell>
                    <TableCell>{getStatusChip(tx.deliveryStatus)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PaymentIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="body2">{tx.paymentMethod}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700} sx={{ color: "#fe3bd4" }}>
                        ${tx.totalPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {tx.deliveryStatus === 0 && (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: "#fe3bd4",
                            color: "white",
                            "&:hover": { backgroundColor: "#d81cb1" },
                            mr: 1,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrepare(tx.transactionId);
                          }}
                        >
                          Prepare
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderColor: "rgba(0, 0, 0, 0.23)", color: "rgba(0, 0, 0, 0.87)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(tx);
                        }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : (
        <Typography align="center" variant="body1" color="text.secondary" sx={{ py: 3 }}>
          No transactions found for the selected status.
        </Typography>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(filteredTransactions.length / itemsPerPage)}
          page={page}
          onChange={handleChangePage}
          color="primary"
          sx={{
            display: "flex",
            justifyContent: "center",
            borderBottom: "none", // <-- remove bottom border
            boxShadow: "none", // <-- ensure no shadow
          }}
        />
      </Box>

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

      <OrderDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        orderDetails={selectedTransaction}
      />
    </Box>
  );
};

export default StoreOrders;
