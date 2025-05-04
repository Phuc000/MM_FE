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
  useMediaQuery, Skeleton, Card, CardContent,
  CardActions, TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Fetch stores
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores`)
      .then((response) => setStores(response.data))
      .catch((error) => console.error('Error fetching stores:', error));
  }, []);

  useEffect(() => {
  if (selectedStore) {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/product/lessdata/${selectedStore}`)
      .then((response) => setInventoryData(response.data))
      .catch((error) => console.error('Error fetching inventory data:', error))
      .finally(() => setLoading(false));
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const paginatedData = inventoryData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
    
        {loading ? (
          isMobile ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} sx={{ my: 2 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={80} />
                </CardContent>
              </Card>
            ))
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {[...Array(5)].map((_, i) => (
                      <TableCell key={i}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(5)].map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : inventoryData.length === 0 ? (
          <Typography variant="body1">No inventory data found.</Typography>
        ) : isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {paginatedData.map((record) => (
            <Card key={`${record.productID}-${record.storeID}`} sx={{ my: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6">{record.productName}</Typography>
                <Typography variant="body1">ID: {record.productID}</Typography>
                <Typography variant="body1">Qty: {record.numberAtStore}</Typography>
                <Typography variant="body1">Price: ${record.price.toFixed(2)}</Typography>
              </CardContent>
              <CardActions sx={{ pt: 0, display: 'flex', justifyContent: 'center' }}>
                <IconButton color="primary" onClick={() => handleEditInventory(record.productID, record.storeID)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteInventory(record.productID, record.storeID)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
          <TablePagination
              component="div"
              count={inventoryData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            </Box>
        ) : (
          <>
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
                  {paginatedData.map((record) => (
                    <TableRow key={`${record.productID}-${record.storeID}`}>
                      <TableCell>{record.productID}</TableCell>
                      <TableCell>{record.productName}</TableCell>
                      <TableCell>{record.numberAtStore}</TableCell>
                      <TableCell>${record.price.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleEditInventory(record.productID, record.storeID)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteInventory(record.productID, record.storeID)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={inventoryData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </>
    )}
    </Box>
    
  );
};

export default ManageInventory;