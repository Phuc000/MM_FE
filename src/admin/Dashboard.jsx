// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [stores, setStores] = useState([]);
  const [revenuePerStore, setRevenuePerStore] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [newCustomersCount, setNewCustomersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions and stores
        const [transactionsRes, storesRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_REACT_APP_API_URL}/transactions`,
            { withCredentials: true }
          ),
          axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores`, {
            withCredentials: true,
          }),
        ]);
        const transactionsData = transactionsRes.data;
        const storesData = storesRes.data;

        // Calculate total revenue
        const totalRev = transactionsData.reduce(
          (sum, tx) => sum + tx.totalPrice,
          0
        );

        // Calculate revenue per store
        const revenueStore = storesData.map((store) => {
          const storeTransactions = transactionsData.filter(
            (tx) => tx.storeID === store.storeID
          );
          const storeRevenue = storeTransactions.reduce(
            (sum, tx) => sum + tx.totalPrice,
            0
          );
          return {
            storeName: store.name,
            revenue: parseFloat(storeRevenue.toFixed(2)),
          };
        });

        setTransactions(transactionsData);
        setStores(storesData);
        setTotalRevenue(parseFloat(totalRev.toFixed(2)));
        setRevenuePerStore(revenueStore);
        // setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        // Fetch customers
        const customersResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/customers`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
        const customersData = customersResponse.data;
        setCustomers(customersData);

        // Calculate number of new customers in the last 30 days
        const now = new Date();
        const lastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        const recentCustomers = customersData.filter((customer) => {
          // Assuming you have a 'createdAt' field in your customer object
          // hardcoded createAt field for testing
          customer.createdAt = '2024-12-12T00:00:00.000Z';
          return new Date(customer.createdAt) >= lastMonth;
        });
        setNewCustomersCount(recentCustomers.length);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    // Run both fetch operations, then remove loading spinner
    Promise.all([fetchData(), fetchUsers()]).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant='h4' gutterBottom mb={5}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Total Revenue */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography 
              variant='h6'
              sx={{
                fontWeight: '900',
                fontFamily: 'Quicksand',
              }}
            >
              Total Revenue
            </Typography>
            <Typography variant='h5'>${totalRevenue}</Typography>
          </Paper>
        </Grid>

        {/* Total Transactions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography
              variant='h6'
              sx={{
                fontWeight: '900',
                fontFamily: 'Quicksand',
              }}
            >
              Total Transactions
            </Typography>
            <Typography variant='h5'>{transactions.length}</Typography>
          </Paper>
        </Grid>

        {/* Total Customers */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography
              variant='h6'
              sx={{
                fontWeight: '900',
                fontFamily: 'Quicksand',
              }}
            >
              Total Customers
            </Typography>
            <Box display="flex" alignItems="center" mt={0}>
              <Typography variant='h5'>{customers.length}</Typography>
              {newCustomersCount > 0 && (
                <Typography variant='body2' color='green' ml={1}>
                  +{newCustomersCount} this month
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Revenue Per Store Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Revenue Per Store
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={revenuePerStore}>
                <XAxis dataKey='storeName' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='revenue' fill='#8884d8' name='Revenue ($)' />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            <Typography variant='h6' gutterBottom>
              Recent Transactions
            </Typography>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Store</TableCell>
                  <TableCell>Amount ($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions
                  .slice(-10)
                  .reverse()
                  .map((tx) => {
                    const store = stores.find((s) => s.storeID === tx.storeID);
                    return (
                      <TableRow key={tx.transactionId}>
                        <TableCell>
                          {new Date(tx.dateAndTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{store ? store.name : 'N/A'}</TableCell>
                        <TableCell>{tx.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;