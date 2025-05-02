import React, { useState } from 'react';
import { Box, Card, Typography, Stack, Chip, Tooltip, Button, Popover, List, ListItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const ProductPromotionCard = ({ promo }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const MAX_VISIBLE_PRODUCTS = 3; // Limit the number of visible chips

  const visibleProducts = showAllProducts
    ? promo.products
    : promo.products.slice(0, MAX_VISIBLE_PRODUCTS);
  const hiddenCount = promo.products.length - MAX_VISIBLE_PRODUCTS;

  const [anchorEl, setAnchorEl] = useState(null);

  const handleExploreClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'products-popover' : undefined;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  return (
    <Card
    variant="outlined"
    sx={{
      position: 'relative',
      display: 'flex',
      // width: 'fit-content',
      width: 400,
      height: 160,
      overflow: 'visible',
      borderRadius: 0,
      borderColor: '#bbb',
      borderWidth: 2,
      borderStyle: 'solid',
      '&:hover': {
        borderColor: '#fe3bd4',
      },
    }}
  >
    {/* Left Section */}
    <Box
      sx={{
        flex: 1,
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h6" sx={{ color: '#fe3bd4', fontWeight: 'bold' }}>
        {promo.name}
      </Typography>
      <Typography variant="body2" sx={{ color: '#444', marginBottom: 1 }}>
        {promo.description}
      </Typography>
      <Typography variant="body2" sx={{ color: '#555' }}>
        <strong>End Date:</strong> {formatDate(promo.endDay)}
      </Typography>

      {/* Explore Button */}
      {promo.products && promo.products.length > 0 && (
          <Button 
            variant="outlined"
            startIcon={<ArrowDropDownIcon />}
            onClick={handleExploreClick}
            sx={{ 
              width: 'fit-content', 
              marginTop: 'auto',
              borderColor: '#fe3bd4',
              color: '#fe3bd4',
              '&:hover': {
                borderColor: '#fe3bd4',
                backgroundColor: 'rgba(254, 59, 212, 0.04)',
              }
            }}
          >
            Explore Products ({promo.products.length})
          </Button>
        )}
        
        {/* Popover for Products */}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          sx={{
            '& .MuiPaper-root': {
              maxHeight: 300,
              width: 250,
              overflowY: 'auto',
              padding: 1,
              borderRadius: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#fe3bd4',
                borderRadius: '6px',
              },
            }
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold', 
              padding: '8px 16px',
              borderBottom: '1px solid #eee',
              color: '#fe3bd4'
            }}
          >
            Promotional Products
          </Typography>
          <List sx={{ padding: 0 }}>
            {promo.products.map((product, index) => (
              <ListItem key={`${product.id}-${index}`} sx={{ padding: '8px 16px' }}>
                <Chip
                  label={product.name}
                  size="medium"
                  sx={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => {
                    // Handle navigation to product detail if needed
                    window.location.href = `/buy-product/${product.id}`;
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Popover>
      </Box>
    {/* Dashed Divider with Cutouts */}
    <Box
      sx={{
        position: 'relative',
        width: 0,
        borderLeft: '2px dashed #ccc',
        marginY: 1,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -25,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 30,
          height: 30,
          backgroundColor: '#fff',
          borderRadius: '50%',
          borderBottom: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -25,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 30,
          height: 30,
          backgroundColor: '#fff',
          borderRadius: '50%',
          borderTop: 'none',
        }}
      />
    </Box>
    {/* Right Section */}
    <Box
      sx={{
        width: 100,
        backgroundColor: '#fe3bd4',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        {(promo.discount * 100).toFixed(0)}%
      </Typography>
      <Typography variant="subtitle2">OFF</Typography>
    </Box>
  </Card>
  );
};

export default ProductPromotionCard;