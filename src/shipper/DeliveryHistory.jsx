// src/admin/DeliveryHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
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
  Skeleton,
  Alert,
  Pagination,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const DeliveryHistory = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isLoading, setIsLoading] = useState(true); // Loading state

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const itemsPerPage = isXs ? 5 : 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchDeliveryHistory = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/transactions`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        const filteredDeliveries = response.data.filter(
          (transaction) =>
            transaction.shipperID === user.id &&
            (transaction.deliveryStatus === 4 || transaction.deliveryStatus === 6),
        );
        setDeliveries(filteredDeliveries);
      } catch (error) {
        console.error("Error fetching delivery history:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch delivery history.",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.id) {
      fetchDeliveryHistory();
    }
  }, [user]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Calculate the data to display based on pagination
  const paginatedDeliveries = deliveries.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Calculate total number of pages
  const totalPages = Math.ceil(deliveries.length / itemsPerPage);

  return (
    <div>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        Delivery History
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          overflowX: "auto",
          boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: 2,
        }}
      >
        <Table aria-label="delivery history table">
          <TableHead
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              display: { xs: "none", sm: "table-header-group" },
            }}
          >
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Date and Time</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {Array.from({ length: 5 }).map((__, i) => (
                    <TableCell key={i}>
                      <Skeleton variant="text" width="100%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {paginatedDeliveries.map((delivery) => (
                  <TableRow
                    key={delivery.transactionId}
                    sx={{
                      display: { xs: "block", sm: "table-row" },
                      marginBottom: { xs: 2, sm: 0 },
                      border: { xs: "1px solid #ccc", sm: "none" },
                      borderRadius: { xs: 2, sm: 0 },
                      padding: { xs: 2, sm: 0 },
                    }}
                  >
                    <TableCell
                      sx={{
                        display: { xs: "flex", sm: "table-cell" },
                        justifyContent: "space-between",
                      }}
                    >
                      <strong className="shipperTableItem">Transaction ID:</strong>
                      {delivery.transactionId}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: "flex", sm: "table-cell" },
                        justifyContent: "space-between",
                      }}
                    >
                      <strong className="shipperTableItem">Date and Time:</strong>
                      {new Date(delivery.dateAndTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: "flex", sm: "table-cell" },
                        justifyContent: "space-between",
                      }}
                    >
                      <strong className="shipperTableItem">Customer ID:</strong>
                      {delivery.customerID}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: "flex", sm: "table-cell" },
                        justifyContent: "space-between",
                      }}
                    >
                      <strong className="shipperTableItem">Total Price:</strong>$
                      {delivery.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: "flex", sm: "table-cell" },
                        justifyContent: "space-between",
                      }}
                    >
                      <strong className="shipperTableItem">Status:</strong>
                      {delivery.deliveryStatus === 4 ? "Delivered" : "Ghost"}
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedDeliveries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No delivery history found.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!isLoading && deliveries.length > itemsPerPage && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            size={isXs ? "small" : "medium"}
          />
        </div>
      )}
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
    </div>
  );
};

export default DeliveryHistory;
