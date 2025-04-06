import React, { useState } from 'react';
import { Box, Card, Typography, Stack, Chip, Tooltip, Button } from '@mui/material';

const ProductPromotionCard = ({ promo }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const MAX_VISIBLE_PRODUCTS = 3; // Limit the number of visible chips

  const visibleProducts = showAllProducts
    ? promo.products
    : promo.products.slice(0, MAX_VISIBLE_PRODUCTS);
  const hiddenCount = promo.products.length - MAX_VISIBLE_PRODUCTS;

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
      width: 'fit-content',
      height: 250,
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
      {/* Scrollable Products Frame */}
      {promo.products && promo.products.length > 0 && (
        <Box
          sx={{
            marginTop: 2,
            maxHeight: 150, // Fixed height for the scrollable frame
            overflowY: 'auto', // Enable vertical scrolling
            '&::-webkit-scrollbar': {
              width: '6px', // Thin scrollbar
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#fe3bd4', // Scrollbar color
              borderRadius: '6px',
            },
          }}
        >
        <Stack direction="column" spacing={1.5}>
            {promo.products.map((product, index) => (
                <Chip
                label={product.name}
                key={`${product.id}-${index}`} // Fixed key syntax
                size="medium" // Medium size is fine, but you can use "small" for compactness
                sx={{ width: 'fit-content' }}
                />
            ))}
        </Stack>
        </Box>
      )}
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