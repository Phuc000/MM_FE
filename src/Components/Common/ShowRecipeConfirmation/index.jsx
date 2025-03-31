import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Checkbox, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Divider,
  Paper,
  IconButton,
  TextField,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import './ShopRecipeConfirmation.scss';

const ShopRecipeConfirmation = ({ recipeData, onConfirm }) => {
  const [items, setItems] = useState(recipeData.cart_actions.map(item => ({
    ...item,
    originalQuantity: item.product.quantity // Store original quantity for reference
  })));
  
  const handleToggleAll = (event) => {
    setItems(items.map(item => ({
      ...item,
      selected: event.target.checked
    })));
  };
  
  const handleToggleItem = (index) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };
  
  // Handle quantity adjustment
  const adjustQuantity = (index, amount) => {
    setItems(items.map((item, i) => {
      if (i === index) {
        // Calculate new quantity, ensuring it's at least 1
        const newQuantity = Math.max(1, item.product.quantity + amount);
        return {
          ...item,
          product: {
            ...item.product,
            quantity: newQuantity
          }
        };
      }
      return item;
    }));
  };
  
  // Handle direct quantity input
  const handleQuantityChange = (index, event) => {
    const value = parseInt(event.target.value, 10);
    if (isNaN(value) || value < 1) return; // Validate input
    
    setItems(items.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          product: {
            ...item.product,
            quantity: value
          }
        };
      }
      return item;
    }));
  };
  
  const selectedCount = items.filter(item => item.selected).length;
  const allSelected = selectedCount === items.length;
  
  return (
    <Paper className="shop-recipe-confirmation">
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Shopping List for {recipeData.recipe_name}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <Checkbox
            checked={allSelected}
            onChange={handleToggleAll}
            sx={{ color: '#fe3bd4', '&.Mui-checked': { color: '#fe3bd4' } }}
          />
          <Typography>
            Select All ({selectedCount}/{items.length})
          </Typography>
        </Box>
        
        <Divider />
        
        <List dense className="item-list">
          {items.map((item, index) => (
            <ListItem 
              key={index}
              className="list-item"
              sx={{ flexDirection: 'column', alignItems: 'flex-start', padding: '4px 0' }}
            >
              <Box display="flex" width="100%" alignItems="center">
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={item.selected}
                    onChange={() => handleToggleItem(index)}
                    tabIndex={-1}
                    disableRipple
                    sx={{ color: '#fe3bd4', '&.Mui-checked': { color: '#fe3bd4' } }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.product.name}
                />
              </Box>
              
              <Box pl={9} width="100%" mt={1}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Typography variant="body2" color="textSecondary">
                      Qty:
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton 
                      size="small"
                      onClick={() => adjustQuantity(index, -1)}
                      disabled={item.product.quantity <= 1}
                      sx={{ color: '#fe3bd4' }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <TextField
                      value={item.product.quantity}
                      onChange={(e) => handleQuantityChange(index, e)}
                      size="small"
                      variant="outlined"
                      inputProps={{ 
                        min: 1, 
                        style: { padding: '4px 8px', width: '40px', textAlign: 'center' } 
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { 
                        '&.Mui-focused fieldset': { borderColor: '#fe3bd4' } 
                      }}}
                    />
                  </Grid>
                  <Grid item>
                    <IconButton 
                      size="small"
                      onClick={() => adjustQuantity(index, 1)}
                      sx={{ color: '#fe3bd4' }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                  
                  {item.product.quantity !== item.originalQuantity && (
                    <Grid item>
                      <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        (Originally: {item.originalQuantity})
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              {index < items.length - 1 && <Divider sx={{ width: '100%', my: 1 }} />}
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center" bgcolor="#f5f5f5">
        <Typography variant="body2" color="textSecondary">
          {selectedCount} items selected
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => onConfirm(items)}
          disabled={selectedCount === 0}
          sx={{ 
            backgroundColor: '#fe3bd4', 
            color: '#fff', 
            '&:hover': { backgroundColor: '#fe3bd4' } 
          }}
        >
          Add to Cart
        </Button>
      </Box>
    </Paper>
  );
};

export default ShopRecipeConfirmation;