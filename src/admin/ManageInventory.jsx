// src/admin/ManageInventory.jsx
import React, { useState, useEffect } from 'react';
import AddInventoryDialog from './AdminComponent/AddInventoryDialog';
import EditInventoryDialog from './AdminComponent/EditInventoryDialog';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ManageInventory = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [inventoryData, setInventoryData] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  useEffect(() => {
    // Fetch stores
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores`)
      .then((response) => setStores(response.data))
      .catch((error) => console.error('Error fetching stores:', error));
  }, []);

  useEffect(() => {
    if (selectedStore) {
      // Fetch inventory data for selected store
      axios
        .get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/product/${selectedStore}`
        )
        .then((response) => setInventoryData(response.data))
        .catch((error) =>
          console.error('Error fetching inventory data:', error)
        );
    } else {
      setInventoryData([]);
    }
  }, [selectedStore]);

  const handleStoreChange = (event) => {
    setSelectedStore(event.target.value);
  };

  const handleEditInventory = (productID, storeID) => {
    const record = inventoryData.find(
      (item) => item.productID === productID && item.storeID === storeID
    );
    const store = stores.find((s) => s.storeID === storeID);
    setSelectedRecord({ ...record, storeName: store.name });
    setOpenEditDialog(true);
  };

  const handleSaveInventory = (updatedRecord) => {
    // Send PUT request to add or restock inventory
    axios
      .put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/products/addtostore/${updatedRecord.productID}/${updatedRecord.storeID}/${updatedRecord.numberAtStore}`
      )
      .then(() => {
        // Update the inventoryData state
        setInventoryData((prevData) =>
          prevData.map((item) =>
            item.productID === updatedRecord.productID &&
            item.storeID === updatedRecord.storeID
              ? { ...item, numberAtStore: item.numberAtStore + updatedRecord.numberAtStore }
              : item
          )
        );
        setOpenEditDialog(false);
      })
      .catch((error) => console.error('Error updating inventory:', error));
  };

  const handleDeleteInventory = (productID, storeID) => {
    // Send DELETE request to delete the inventory record
    axios
      .delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/products/${productID}/${storeID}`
      )
      .then(() => {
        // Update the inventoryData state
        setInventoryData((prevData) =>
          prevData.filter(
            (item) =>
              !(item.productID === productID && item.storeID === storeID)
          )
        );
      })
      .catch((error) => console.error('Error deleting inventory:', error));
  };

  const handleAddInventory = () => {
    setOpenAddDialog(true);
  };

  const handleSaveNewInventory = (newRecord) => {
    // Send PUT request to add or restock inventory
    axios
      .put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/products/addtostore/${newRecord.productID}/${newRecord.storeID}/${newRecord.numberAtStore}`
      )
      .then(() => {
        // Check if the product already exists in inventoryData
        const existingRecord = inventoryData.find(
          (item) =>
            item.productID === newRecord.productID &&
            item.storeID === newRecord.storeID
        );
        if (existingRecord) {
          // Update the existing record's quantity
          setInventoryData((prevData) =>
            prevData.map((item) =>
              item.productID === newRecord.productID &&
              item.storeID === newRecord.storeID
                ? {
                    ...item,
                    numberAtStore:
                      parseInt(item.numberAtStore, 10) +
                      parseInt(newRecord.numberAtStore, 10),
                  }
                : item
            )
          );
        } else {
          // Add new record to inventoryData
          const productDetails = availableProducts.find(
            (product) => product.productID === newRecord.productID
          );
          const newInventoryItem = {
            productID: newRecord.productID,
            storeID: newRecord.storeID,
            numberAtStore: newRecord.numberAtStore,
            product: productDetails,
          };
          setInventoryData((prevData) => [...prevData, newInventoryItem]);
        }
        setOpenAddDialog(false);
      })
      .catch((error) => console.error('Error adding inventory record:', error));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Inventory
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="store-select-label">Select Store</InputLabel>
        <Select
          labelId="store-select-label"
          id="store-select"
          value={selectedStore}
          label="Select Store"
          onChange={handleStoreChange}
        >
          {stores.map((store) => (
            <MenuItem key={store.storeID} value={store.storeID}>
              {store.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedStore && (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddInventory}
            sx={{ mb: 2 }}
          >
            Add New Inventory Record
          </Button>
          <AddInventoryDialog
            open={openAddDialog}
            handleClose={() => setOpenAddDialog(false)}
            handleSave={handleSaveNewInventory}
            selectedStore={selectedStore}
            existingProducts={inventoryData.map((item) => item.productID)}
          />
          <EditInventoryDialog
            open={openEditDialog}
            handleClose={() => setOpenEditDialog(false)}
            handleSave={handleSaveInventory}
            record={selectedRecord}
          />
          <TableContainer component={Paper}>
            <Table aria-label="inventory table">
              <TableHead>
                <TableRow>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryData.map((record) => (
                  <TableRow key={`${record.productID}-${record.storeID}`}>
                    <TableCell>{record.productID}</TableCell>
                    <TableCell>{record.product.name}</TableCell>
                    <TableCell>{record.numberAtStore}</TableCell>
                    <TableCell>${record.product.price.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleEditInventory(
                            record.productID,
                            record.storeID
                          )
                        }
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDeleteInventory(
                            record.productID,
                            record.storeID
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {inventoryData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No inventory data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {!selectedStore && (
        <Typography variant="h6" gutterBottom>
          Please select a store to view its inventory.
        </Typography>
      )}
    </Box>
  );
};

export default ManageInventory;