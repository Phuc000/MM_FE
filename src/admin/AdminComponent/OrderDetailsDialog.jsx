// src/admin/OrderDetailsDialog.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";

const OrderDetailsDialog = ({ open, handleClose, orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (open && orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((response) => response.json())
        .then((data) => setOrderDetails(data))
        .catch((error) => console.error("Error fetching order details:", error));
    }
  }, [open, orderId]);

  if (!orderDetails) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Order Details</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Order ID: {orderDetails.id}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Customer: {orderDetails.customerName}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Store: {orderDetails.storeName}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Payment Method: {orderDetails.paymentMethod}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Date and Time: {new Date(orderDetails.dateAndTime).toLocaleString()}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Total Price: ${orderDetails.totalPrice.toFixed(2)}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Delivery Status: {orderDetails.deliveryStatus}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Included Products
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product ID</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderDetails.includes.map((item) => (
              <TableRow key={item.productID}>
                <TableCell>{item.productID}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.numberOfProductInBill}</TableCell>
                <TableCell>${item.subTotal.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;
