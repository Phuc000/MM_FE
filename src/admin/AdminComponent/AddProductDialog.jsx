// src/admin/AddProductDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const AddProductDialog = ({ open, handleClose, handleSave, availableCategories }) => {
  const [product, setProduct] = useState({
    image: '',
    consistency: '',
    name: '',
    nameClean: '',
    originalName: '',
    amount: '',
    unit: '',
    price: '',
    aisle: '',
    description: '',   
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const onSave = () => {
    // Validate product data
    handleSave(product);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Product Name"
          name="name"
          value={product.name}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Name Clean"
          name="nameClean"
          value={product.nameClean}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Original Name"
          name="originalName"
          value={product.originalName}
          onChange={handleChange}
          fullWidth
          required
        />
        <FormControl margin="dense" fullWidth required>
          <InputLabel id="consistency-label">Consistency</InputLabel>
          <Select
            labelId="consistency-label"
            name="consistency"
            value={product.consistency}
            onChange={handleChange}
            label="Consistency"
          >
            <MenuItem value="SOLID">SOLID</MenuItem>
            <MenuItem value="LIQUID">LIQUID</MenuItem>
          </Select>
        </FormControl>
        <FormControl margin="dense" fullWidth required>
          <InputLabel id="category-label">Aisle</InputLabel>
          <Select
            labelId="category-label"
            name="aisle"
            value={product.aisle}
            onChange={handleChange}
            label="Aisle"
          >
            {availableCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Description"
          name="description"
          value={product.description}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Price"
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Amount"
          name="amount"
          type="number"
          value={product.amount}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Unit"
          name="unit"
          value={product.unit}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Image URL"
          name="image"
          value={product.image}
          onChange={handleChange}
          fullWidth
          required
        />
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

export default AddProductDialog;