// src/admin/AddUserDialog.jsx
import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import PasswordGenerator from "./PasswordGenerator"; // Assuming you have this component
import axios from "axios";
import { toast } from "react-toastify";

const AddUserDialog = ({ open, handleClose, handleSave }) => {
  const [user, setUser] = useState({
    fName: "",
    lName: "",
    address: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    salary: "",
    storeID: "",
  });

  const [stores, setStores] = useState([]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSave = () => {
    handleSave(user);
    handleClose();
  };

  useEffect(() => {
    // Fetch stores
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores`)
      .then((response) => setStores(response.data))
      .catch((error) => {
        console.error("Error fetching stores:", error);
        toast.error("Failed to load stores");
      });
  }, []);

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
        <PasswordGenerator
          password={user.password}
          setPassword={(pw) => setUser({ ...user, password: pw })}
        />
        <FormControl fullWidth margin="dense" required>
          <InputLabel>Role</InputLabel>
          <Select name="role" value={user.role} onChange={handleChange} label="Role">
            <MenuItem value="Shipper">Shipper</MenuItem>
            <MenuItem value="StoreManager">Store Manager</MenuItem>
          </Select>
        </FormControl>
        {user.role === "StoreManager" && (
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
              select
              margin="dense"
              label="Store"
              name="storeID"
              value={user.storeID}
              onChange={handleChange}
              fullWidth
              required
            >
              {stores.map((store) => (
                <MenuItem key={store.storeID} value={store.storeID}>
                  {store.name} {/* or any readable name */}
                </MenuItem>
              ))}
            </TextField>
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
