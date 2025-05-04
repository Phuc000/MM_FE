// src/admin/AddUserDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const AddUserDialog = ({ open, handleClose, handleSave }) => {
  const [user, setUser] = useState({
    fName: '',
    lName: '',
    address: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: '',
    salary: '',
    storeID: '',
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSave = () => {
    handleSave(user);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="First Name"
          name="fName"
          value={user.fName}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Last Name"
          name="lName"
          value={user.lName}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Address"
          name="address"
          value={user.address}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Email"
          name="email"
          value={user.email}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Phone Number"
          name="phoneNumber"
          value={user.phoneNumber}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Password"
          name="password"
          type="password"
          value={user.password}
          onChange={handleChange}
          fullWidth
          required
        />
        <FormControl fullWidth margin="dense" required>
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={user.role}
            onChange={handleChange}
            label="Role"
          >
            <MenuItem value="Shipper">Shipper</MenuItem>
            <MenuItem value="StoreManager">Store Manager</MenuItem>
          </Select>
        </FormControl>
        {user.role === 'StoreManager' && (
          <>
            <TextField
              margin="dense"
              label="Salary"
              name="salary"
              type="number"
              value={user.salary}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Store ID"
              name="storeID"
              value={user.storeID}
              onChange={handleChange}
              fullWidth
              required
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;