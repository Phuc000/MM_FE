// src/admin/AddInventoryDialog.jsx
import React, { useState, useEffect } from 'react';
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
import axios from 'axios';

const categoryList = [
  'Vegetable',
  'Seafood',
  'Spice',
  'Grain',
  'Sauce',
  'Beef',
  'Milk',
  'Fruit',
  'Pork',
];

const AddInventoryDialog = ({
  open,
  handleClose,
  handleSave,
  selectedStore,
  existingProducts,
}) => {
  const [inventoryRecord, setInventoryRecord] = useState({
    productID: '',
    storeID: selectedStore,
    numberAtStore: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    if (selectedCategory) {
      // Fetch products in the selected category
      axios
        .get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/category/${selectedCategory}`)
        .then((response) => {
          const categoryProducts = response.data;
          // Filter out products already in the store's inventory
          const productsNotInStore = categoryProducts.filter(
            (product) => !existingProducts.includes(product.productID)
          );
          setAvailableProducts(productsNotInStore);
        })
        .catch((error) => console.error('Error fetching products:', error));
    } else {
      setAvailableProducts([]);
    }
  }, [selectedCategory, existingProducts]);

  const handleChange = (e) => {
    setInventoryRecord({
      ...inventoryRecord,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // Reset product selection when category changes
    setInventoryRecord((prev) => ({ ...prev, productID: '' }));
  };

  const onSave = () => {
    handleSave({
      ...inventoryRecord,
      numberAtStore: parseInt(inventoryRecord.numberAtStore, 10),
      storeID: selectedStore,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Inventory Record</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense" required>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="Category"
          >
            {categoryList.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedCategory && (
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Product</InputLabel>
            <Select
              name="productID"
              value={inventoryRecord.productID}
              onChange={handleChange}
              label="Product"
            >
              {availableProducts.length === 0 && (
                <MenuItem disabled>No products available</MenuItem>
              )}
              {availableProducts.map((product) => (
                <MenuItem key={product.productID} value={product.productID}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          margin="dense"
          label="Quantity"
          name="numberAtStore"
          type="number"
          value={inventoryRecord.numberAtStore}
          onChange={handleChange}
          fullWidth
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={
            !inventoryRecord.productID ||
            !inventoryRecord.numberAtStore ||
            !selectedCategory
          }
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddInventoryDialog;