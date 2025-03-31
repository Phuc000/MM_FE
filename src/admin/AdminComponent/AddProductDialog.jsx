// src/admin/AddProductDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

const AddProductDialog = ({ open, handleClose, handleSave }) => {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    weight: '',
    image: '',
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
          label="Category"
          name="category"
          value={product.category}
          onChange={handleChange}
          fullWidth
          required
        />
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
          label="Weight"
          name="weight"
          type="number"
          value={product.weight}
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