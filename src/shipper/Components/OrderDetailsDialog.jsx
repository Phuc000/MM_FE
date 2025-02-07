// src/shipper/OrderDetailsDialog.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableContainer,
  Paper,
  DialogActions,
  Button,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const OrderDetailsDialog = ({ open, onClose, transactionId }) => {
  const [transaction, setTransaction] = useState(null);
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [store, setStore] = useState(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/${transactionId}`,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        setTransaction(response.data);
        
        // Fetch store details
        const storeResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/stores/${response.data.storeID}`,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        setStore(storeResponse.data);

        if (user.role === "Customer") {
          setCustomer(user);
        }
        else {
          // Fetch customer details
          const customerResponse = await axios.get(
            `${import.meta.env.VITE_REACT_APP_API_URL}/customers/${response.data.customerID}`,
            {
              headers: { 'Content-Type': 'application/json' },
              withCredentials: true,
            }
          ); 
          setCustomer(customerResponse.data);
        }
      } catch (error) {
        console.error('Error fetching transaction or customer details:', error);
      }
    };

    if (transactionId) {
      fetchTransactionDetails();
    }
  }, [transactionId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: 'Quicksand',
          fontWeight: '900',
          fontSize: '2rem',
        }}
      >
        Order Details
      </DialogTitle>
      <DialogContent>
        {transaction && customer && store ? (
          <>
            <Typography variant="h6">Store Information</Typography>
            <Typography>Name: {store.name}</Typography>
            <Typography>Location: {store.location}</Typography>
            <Typography>Contact: {store.contactInfo}</Typography>
            <Typography variant="h6">Customer Information</Typography>
            <Typography>
              Name: {customer.fName} {customer.lName}
            </Typography>
            <Typography>Address: {customer.address}</Typography>
            <Typography>Phone: {customer.phoneNumber}</Typography>
            <Typography>Email: {customer.email}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Products
            </Typography>
            <TableContainer component={Paper}>
              <Table aria-label="products table">
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transaction.includes.map((item) => (
                    <TableRow key={item.productID}>
                      <TableCell>{item.product.pName}</TableCell>
                      <TableCell>{item.product.description}</TableCell>
                      <TableCell>{item.product.category}</TableCell>
                      <TableCell>{item.numberOfProductInBill}</TableCell>
                      <TableCell>${item.product.price.toFixed(2)}</TableCell>
                      <TableCell>${item.subTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Order Summary
            </Typography>
            <Typography>Total Price: ${transaction.totalPrice.toFixed(2)}</Typography>
            <Typography>Total Weight: {transaction.totalWeight} g</Typography>
            <Typography>Payment Method: {transaction.paymentMethod}</Typography>
            <Typography>
              Order Date: {new Date(transaction.dateAndTime).toLocaleString()}
            </Typography>
            <Typography>
              Shipping Adress: {transaction.shippingAddress}
            </Typography>
          </>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained"
          sx={{
            backgroundColor: '#fe3bd4',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;