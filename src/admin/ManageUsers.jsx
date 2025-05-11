// src/admin/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import AddUserDialog from './AdminComponent/AddUserDialog';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Block as BlockIcon,
  
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import EditUserDialog from '../Components/Common/ManagerComponents/EditUserDialog';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
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
        const customers = customersResponse.data.map((customer) => ({
          ...customer,
          role: 'Customer',
        }));

        // Fetch employees
        const employeesResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/employees`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
        const employees = employeesResponse.data.map((employee) => ({
          ...employee,
          role: 'StoreManager',
        }));

        // Fetch shippers
        const shippersResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/shippers`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
        const shippers = shippersResponse.data.map((shipper) => ({
          ...shipper,
          role: 'Shipper',
        }));

        // Combine all users
        const allUsers = [...customers, ...employees, ...shippers];
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  const handleAddUser = () => {
    setOpenAddDialog(true);
  };

  const handleSaveUser = (newUser) => {
    // Depending on role, select the correct endpoint
    let endpoint = '';
    if (newUser.role === 'Customer') {
      endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/users/register/customer`;
    } else if (newUser.role === 'StoreManager') {
      endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/users/register/storemanager`;
      newUser.ePhone = newUser.phoneNumber; // Map phoneNumber to ePhone for employees
      delete newUser.phoneNumber; // Remove phoneNumber from newUser
    } else if (newUser.role === 'Shipper') {
      endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/users/register/shipper`;
      newUser.sPhoneNo = newUser.phoneNumber; // Map phoneNumber to sPhoneNumber for shippers
      delete newUser.phoneNumber; // Remove phoneNumber from newUser
      newUser.sEmail = newUser.email; // Map email to sEmail for shippers
      delete newUser.email; // Remove email from newUser
    }

    console.log('New User:', newUser);

    // Send POST request to add user
    axios.post(endpoint, newUser, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    })
      .then((response) => {
        // Update the users list
        setUsers([...users, { ...response.data, role: newUser.role }]);
        toast.success(`${newUser.role} ${newUser.fName} ${newUser.lName} added successfully`);
      })
      .catch((error) => {
        console.error('Error adding user:', error);
        toast.error(error.response?.data?.message || `Failed to add ${newUser.role.toLowerCase()}`);
      })
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
    toast.info('Edit functionality coming soon');
  };

  // Add new handleUpdateUser function
  const handleUpdateUser = (updatedUser) => {
    // Update the users state with the updated user
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  };

  const handleDeleteUser = (user) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Depending on role, select the correct endpoint
      let endpoint = '';
      if (user.role === 'Customer') {
        endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/customers/${user.id}`;
      } else if (user.role === 'StoreManager') {
        endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/employees/${user.id}`;
      } else if (user.role === 'Shipper') {
        endpoint = `${import.meta.env.VITE_REACT_APP_API_URL}/shippers/${user.id}`;
      }

      axios.delete(endpoint, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })
        .then(() => {
          // Remove the deleted user from the state
          setUsers(users.filter((u) => u.id !== user.id));
          toast.success(`${user.role} ${user.fName} ${user.lName} deleted successfully`);
        })
        .catch((error) => {
          console.error('Error deleting user:', error);
          toast.error(`Failed to delete ${user.role.toLowerCase()}`);
        } );
    }
  };

  const handleBan = (user) => {
    console.log('Ban user:', user);
    // This is just a placeholder - implement actual ban API call here
    // For now, just show a success toast for demonstration
    try {
      // Simulate API call: await axios.post(`/api/customers/${user.id}/ban`);
      toast.success(`Customer ${user.fName} ${user.lName} banned successfully`);
    } catch (error) {
      toast.error('Failed to ban customer');
    }
  }

  // Skeleton component for loading state
  const UserSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        isMobile ? (
          <Box key={`skeleton-${index}`} sx={{ mb: 3, mx: { xs: 1, sm: 0 } }}>
            <Skeleton
              animation="wave"
              variant="rectangular"
              height={150}
              sx={{ borderRadius: '4px' }}
            />
            <Skeleton
              animation="wave"
              width="60%"
              height={20}
              sx={{ mt: 1, mx: 'auto' }}
            />
          </Box>
        ) : (
          <TableRow key={`skeleton-${index}`}>
            <TableCell>
              <Skeleton animation="wave" width={60} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={150} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={80} />
            </TableCell>
            <TableCell>
              <Skeleton animation="wave" width={200} />
            </TableCell>
            <TableCell align="right">
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Skeleton animation="wave" width={32} height={32} sx={{ mr: 1 }} />
                <Skeleton animation="wave" width={32} height={32} />
              </Box>
            </TableCell>
          </TableRow>
        )
      ));
  };

  // Card component for mobile view
  const UserCard = ({ user }) => {
    let additionalInfo = '';
    if (user.role === 'Customer') {
      additionalInfo = `Fortune Chances: ${user.fortuneChance} | Total Money Spent: $${user.totalMoneySpent.toFixed(2)}`;
    } else if (user.role === 'StoreManager') {
      additionalInfo = `Salary: ${user.salary} | Store ID: ${user.storeID}`;
    } else if (user.role === 'Shipper') {
      additionalInfo =  "";
    }

    return (
      <Card sx={{ mb: 3, mx: { xs: 1, sm: 0 } }}>
        <CardContent sx={{pb:0}}>
          <Typography variant="subtitle2" color="text.secondary">
            ID: {user.id}
          </Typography>
          <Typography variant="h6">{`${user.fName} ${user.lName}`}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Email: {user.email}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Role: {user.role}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {additionalInfo}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <IconButton color="primary" onClick={() => handleEditUser(user)}>
            <EditIcon />
          </IconButton>
          {user.role === 'Customer' ? (
            <IconButton color="error" onClick={() => handleBan(user)}>
              <BlockIcon />
            </IconButton>
          ) : (
            <IconButton color="error" onClick={() => handleDeleteUser(user)}>
              <DeleteIcon />
            </IconButton>
          )}
        </CardActions>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAddIcon />}
        onClick={handleAddUser}
        sx={{ mb: 2 }}
      >
        Add New User
      </Button>
      <AddUserDialog
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        handleSave={handleSaveUser}
      />
      {/* Add this before the closing Box tag */}
      <EditUserDialog
        open={openEditDialog}
        handleClose={() => setOpenEditDialog(false)}
        handleSave={handleUpdateUser}
        user={selectedUser}
      />
      <TableContainer component={Paper}>
        <Table aria-label="users table">
          <TableHead sx={{ display: { xs: 'none', sm: 'table-header-group' } }}>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Additional Info</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <UserSkeletons />
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="text.secondary">
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isMobile ? (
              // Mobile: Card view
              users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))
            ) : (
              // Desktop: Table view
              users.map((user) => {
                let additionalInfo = '';
                if (user.role === 'Customer') {
                  additionalInfo = `Fortune Chances: ${user.fortuneChance} | Total Money Spent: $${user.totalMoneySpent.toFixed(2)}`;
                } else if (user.role === 'StoreManager') {
                  additionalInfo = `Salary: ${user.salary} | Store ID: ${user.storeID}`;
                } else if (user.role === 'Shipper') {
                  additionalInfo = "";
                }

                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{`${user.fName} ${user.lName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{additionalInfo}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditUser(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      {user.role === 'Customer' ? (
                        <IconButton color="error" onClick={() => handleBan(user)}>
                          <BlockIcon />
                        </IconButton>
                      ) : (
                        <IconButton color="error" onClick={() => handleDeleteUser(user)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ManageUsers;