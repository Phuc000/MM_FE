import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
} from "@mui/material";
import { AttachMoney as MoneyIcon } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

// Edit User Dialog Component
const EditUserDialog = ({ open, handleClose, handleSave, user }) => {
  const [formData, setFormData] = useState({});
  const [originalStoreID, setOriginalStoreID] = useState("");
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
      console.log("User:", user);

      // If Store Manager, store the original storeID for comparison later
      if (user.role === "Employee" && user.storeID) {
        setOriginalStoreID(user.storeID);
      }

      // If user is a Store Manager, fetch available stores
      if (user.role === "Employee") {
        setLoading(true);
        axios
          .get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores`)
          .then((response) => {
            setStores(response.data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching stores:", error);
            setLoading(false);
          });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for numeric values
    if (name === "totalMoneySpentReduction" || name === "salary") {
      // Ensure value is a valid number or empty string
      if (value === "" || !isNaN(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onSave = async () => {
    try {
      if (user.role === "Customer") {
        // For customer, reduce the total money spent
        const reduction = parseFloat(formData.totalMoneySpentReduction || 0);

        // const updatedTotalMoneySpent = reduction > user.totalMoneySpent ? 0 : user.totalMoneySpent - reduction;

        const response = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/customers/totalmoney/${user.id}/${-reduction.toFixed(2)}`,
        );

        console.log("Response:", response.data);

        // Return the updated user
        handleSave({
          ...user,
          totalMoneySpent: response.data.totalMoneySpent,
          fortuneChance: response.data.fortuneChance,
        });

        toast.success("Customer total money spent updated successfully");
      } else if (user.role === "Employee") {
        // For employee (store manager)
        const updatedEmployee = {
          fName: formData.fName,
          lName: formData.lName,
          salary: parseFloat(formData.salary),
          address: formData.address,
          phone: formData.phoneNumber,
          storeID: formData.storeID,
        };
        // First update the basic employee info
        const response = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/employees/${user.id}`,
          updatedEmployee,
        );

        const responseEmployee = {
          fName: response.data.fName,
          lName: response.data.lName,
          salary: parseFloat(response.data.salary),
          address: response.data.address,
          phoneNumber: response.data.phoneNumber,
          storeID: response.data.storeID,
        };

        // Return the updated user
        handleSave({
          ...user,
          ...responseEmployee,
        });

        toast.success("Store manager information updated successfully");
      } else if (user.role === "Shipper") {
        // For shipper
        const updatedShipper = {
          fName: formData.fName,
          lName: formData.lName,
          address: formData.address,
          SPhoneNo: formData.phoneNumber,
        };

        const response = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/shippers/${user.id}`,
          updatedShipper,
        );

        const responseShipper = {
          fName: response.data.fName,
          lName: response.data.lName,
          address: response.data.address,
          phoneNumber: response.data.phoneNumber,
        };

        // Return the updated user
        handleSave({
          ...user,
          ...updatedShipper,
        });

        toast.success("Shipper information updated successfully");
      }

      handleClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user information");
    }
  };

  // Generate dialog title based on user role
  const getDialogTitle = () => {
    if (!user) return "Edit User";

    switch (user.role) {
      case "Customer":
        return "Edit Total Money Spent";
      case "Employee":
        return "Edit Store Manager Info";
      case "Shipper":
        return "Edit Shipper Info";
      default:
        return "Edit User";
    }
  };

  // Return early if no user
  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 1 }}>{getDialogTitle()}</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {/* Customer Form */}
        {user.role === "Customer" && (
          <TextField
            margin="dense"
            label="Reduction Amount"
            name="totalMoneySpentReduction"
            type="number"
            value={formData.totalMoneySpentReduction || ""}
            onChange={handleChange}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon />
                </InputAdornment>
              ),
            }}
            helperText={`Current total: $${user.totalMoneySpent.toFixed(2)}`}
          />
        )}

        {/* Store Manager Form */}
        {user.role === "Employee" && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="First Name"
                name="fName"
                value={formData.fName || ""}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Last Name"
                name="lName"
                value={formData.lName || ""}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary || ""}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Store</InputLabel>
                <Select
                  name="storeID"
                  value={formData.storeID || ""}
                  label="Store"
                  onChange={handleChange}
                  disabled={loading}
                >
                  {stores.map((store) => (
                    <MenuItem key={store.storeID} value={store.storeID}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Phone"
                name="phone"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
        )}

        {/* Shipper Form */}
        {user.role === "Shipper" && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="First Name"
                name="fName"
                value={formData.fName || ""}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Last Name"
                name="lName"
                value={formData.lName || ""}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
