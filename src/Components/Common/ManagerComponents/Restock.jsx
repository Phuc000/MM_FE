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
  InputAdornment,
  Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const Restock = () => {
  const { user } = useAuth();
  const [storeID, setStoreID] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [amount, setAmount] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isRestock, setIsRestock] = useState(true);
  const [loading, setLoading] = useState(false);

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
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/product/lessdata/${storeID}`);
        const formattedProducts = response.data.map(item => ({
          id: item.productID,
          name: item.productName,
          stock: item.numberAtStore,
          ...item
        }));
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error('Error fetching products');
      } finally {
        setLoading(false);
      }
    };
  
    if (storeID) {
      fetchProducts();
    }
  }, [storeID]);

  // Update debouncedSearchTerm 1 second after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


  // Filter products when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [debouncedSearchTerm, products]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

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

      // Update both products and filtered products
      const updateProductList = (prevList) => prevList.map(prod => {
        if (prod.id === selectedProduct.id) {
          return {
            ...prod,
            stock: prod.stock + finalAmount
          };
        }
        return prod;
      });
      
      setProducts(updateProductList);
      setFilteredProducts(updateProductList);

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
      width: 150 
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
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "900",
          fontFamily: "Quicksand",
        }}
      >
        Restock
      </Typography>
      
      {/* Search field */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }}
        />
      </Box>

      {loading ? (
  <>
    {[...Array(10)].map((_, i) => (
      <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1 }} />
    ))}
  </>
) : (
  <DataGrid
    rows={filteredProducts}
    columns={columns}
    pageSize={10}
    rowsPerPageOptions={[10, 25, 50]}
    disableSelectionOnClick
    density="compact"
    sx={{
      '& .MuiDataGrid-row:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      }
    }}
  />
)}

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