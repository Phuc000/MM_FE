import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useAuth } from "../../../hooks/useAuth";
import {
  Typography,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const Restock = () => {
  const { user } = useAuth();
  const [storeID, setStoreID] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [amount, setAmount] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isRestock, setIsRestock] = useState(true);

  useEffect(() => {
    const fetchStoreID = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/employees/${user.id}`);
        setStoreID(response.data.storeID);
      } catch (error) {
        console.error("Error fetching store ID:", error);
      }
    };

    if (user?.id) {
      fetchStoreID();
    }
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/product/${storeID}`);
        const formattedProducts = response.data.map(item => ({
          id: item.productID,
          name: item.product.pName,
          stock: item.numberAtStore,
          description: item.product.description,
          ...item
        }));
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error('Error fetching products');
      }
    };

    if (storeID) {
      fetchProducts();
    }
  }, [storeID]);

  const handleStockChange = (product, restock) => {
    setSelectedProduct(product);
    setIsRestock(restock);
    setAmount("");
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!amount || !selectedProduct) return;

    const finalAmount = isRestock ? Math.abs(Number(amount)) : -Math.abs(Number(amount));

    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/products/addtostore/${selectedProduct.id}/${storeID}/${finalAmount}`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setProducts(prevProducts => prevProducts.map(prod => {
        if (prod.id === selectedProduct.id) {
          return {
            ...prod,
            stock: prod.stock + finalAmount
          };
        }
        return prod;
      }));

      toast.success(`Successfully ${isRestock ? 'restocked' : 'removed'} products`);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error(`Error ${isRestock ? 'restocking' : 'removing'} products`);
    }
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'Product ID', 
      width: 100,
    },
    { 
      field: 'name', 
      headerName: 'Product Name', 
      flex: 1 
    },
    { 
      field: 'stock', 
      headerName: 'Current Stock', 
      width: 130 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleStockChange(params.row, true)}
            sx={{ mr: 1 }}
          >
            +
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => handleStockChange(params.row, false)}
          >
            -
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={products}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableSelectionOnClick
        density="compact"
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {isRestock ? 'Restock' : 'Remove'} {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ 
              min: "1",
              max: isRestock ? undefined : selectedProduct?.stock 
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color={isRestock ? "primary" : "error"}
            disabled={!amount || (!isRestock && Number(amount) > (selectedProduct?.stock || 0))}
          >
            {isRestock ? 'Restock' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Restock;