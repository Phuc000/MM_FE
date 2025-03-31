// src/Components/Common/ShopRecipeConfirmation/ShopRecipeConfirmation.jsx
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
  Paper
} from '@mui/material';
import './ShopRecipeConfirmation.scss';

const ShopRecipeConfirmation = ({ recipeData, onConfirm }) => {
  const [items, setItems] = useState(recipeData.cart_actions);
  
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
            // set custom color for checkbox
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
              button 
              onClick={() => handleToggleItem(index)}
              className="list-item"
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={item.selected}
                  tabIndex={-1}
                  disableRipple
                  sx={{ color: '#fe3bd4', '&.Mui-checked': { color: '#fe3bd4' } }}
                />
              </ListItemIcon>
              <ListItemText
                primary={item.product.name}
                secondary={`Quantity: ${item.product.quantity}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Box p={2} display="flex" justifyContent="flex-end" bgcolor="#f5f5f5">
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
          Add {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'} to Cart
        </Button>
      </Box>
    </Paper>
  );
};

export default ShopRecipeConfirmation;