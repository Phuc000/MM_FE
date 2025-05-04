// src/admin/ManageProducts.jsx
import React, { useState, useEffect } from 'react';
import AddProductDialog from './AdminComponent/AddProductDialog';
import EditProductDialog from './AdminComponent/EditProductDialog';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Skeleton,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Alcoholic Beverages');

  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Fetch categroies using axios
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/products/category`
        );
        // console.log('Fetched categories:', response.data);
        setCategoryList(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();  
  }, []);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true); // start loading
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/products/category/${selectedCategory}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false); // stop loading
      }
    };
  
    fetchProductsByCategory();
  }, [selectedCategory]);

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const handleAddProduct = () => {
    setOpenAddDialog(true);
  };

  const handleSaveProduct = async (newProduct) => {
    newProduct.price = parseFloat(newProduct.price);
    newProduct.weight = parseInt(newProduct.weight, 10);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/products`,
        newProduct
      );
      // Update the products list
      setProducts([...products, response.data]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEditProduct = (productId) => {
    console.log('Editing product with ID:', productId);
    const product = products.find((p) => p.productID === productId);
    setSelectedProduct(product);
    setOpenEditDialog(true);
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/products/${updatedProduct.productID}`,
        updatedProduct
      );
      // Update the products list in state
      setProducts(
        products.map((product) =>
          product.productID === response.data.productID ? response.data : product
        )
      );
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_REACT_APP_API_URL}/products/${productId}`
        );
        // Remove the deleted product from the state
        setProducts(products.filter((product) => product.productID !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Products
      </Typography>
      {/* Category Selection */}
      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel id="category-select-label">Select Category</InputLabel>
        <Select
          labelId="category-select-label"
          value={selectedCategory}
          label="Select Category"
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categoryList.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddProduct}
        sx={{ mb: 2, ml: 2 }}
      >
        Add New Product
      </Button>
      <AddProductDialog
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        handleSave={handleSaveProduct}
      />
      {isMobile ? (
  // Card view for mobile
  loading ? (
    [...Array(3)].map((_, i) => (
      <Card key={i} sx={{ my: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" height={100} />
        </CardContent>
      </Card>
    ))
  ) : (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    {products.map((product) => (
      <Card key={product.productID} sx={{ my: 2}}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6">{product.name}</Typography>
          <Typography variant="body1">Price: ${product.price}</Typography>
          <Typography variant="body1">Amount: {product.amount} {product.unit}</Typography>
          <Typography variant="body1">Consistency: {product.consistency}</Typography>
          <Typography variant="body1" noWrap>Image: {product.image}</Typography>
        </CardContent>
        <CardActions sx={{pt: 0, display: 'flex', justifyContent: 'center'}}>
          <IconButton color="primary" onClick={() => handleEditProduct(product.productID)} >
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteProduct(product.productID)}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    ))}
    <EditProductDialog
          open={openEditDialog}
          handleClose={() => setOpenEditDialog(false)}
          handleSave={handleUpdateProduct}
          product={selectedProduct}
        />
    </Box>
  )
) : (
  // Table view for desktop
  <TableContainer component={Paper}>
    <Table aria-label="products table">
      <TableHead>
        <TableRow>
          <TableCell>Product ID</TableCell>
          <TableCell>Product Name</TableCell>
          <TableCell align="right">Price</TableCell>
          <TableCell align="right">Unit</TableCell>
          <TableCell align="right">Amount</TableCell>
          <TableCell align="right">Consistency</TableCell>
          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Image URL
          </TableCell>
          <TableCell align="right" sx={{ minWidth: 120 }}>
            Actions
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 8 }).map((_, j) => (
                <TableCell key={j}><Skeleton /></TableCell>
              ))}
            </TableRow>
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <TableRow key={product.productID}>
              <TableCell>{product.productID}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell align="right">${product.price}</TableCell>
              <TableCell align="right">
                {["milliliter", "milliliters"].includes(product.unit) ? 'ml' :
                 ["gram", "grams"].includes(product.unit) ? 'g' : product.unit}
              </TableCell>
              <TableCell align="right">{product.amount}</TableCell>
              <TableCell align="right">{product.consistency}</TableCell>
              <TableCell sx={{ maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.image}
              </TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>
                <IconButton color="primary" onClick={() => handleEditProduct(product.productID)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteProduct(product.productID)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} align="center">
              No products found in this category.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    <EditProductDialog
          open={openEditDialog}
          handleClose={() => setOpenEditDialog(false)}
          handleSave={handleUpdateProduct}
          product={selectedProduct}
        />
  </TableContainer>
)}


      
    </Box>
  );
};

export default ManageProducts;