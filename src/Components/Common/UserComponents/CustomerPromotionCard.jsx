import React from 'react';
import { Box, Card, Typography, Stack, Chip, Tooltip } from '@mui/material';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const CustomerPromotionCard = ({ promo }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        display: 'flex',
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
        {/* Product Frame (No Scrolling Needed for Single Product) */}
        {promo.product && (
          <Box sx={{ marginTop: 1 }}>
            <Stack direction="row" spacing={1}>
              <Tooltip key={promo.product.productID} title={promo.product.name}>
                <Chip label={promo.product.name} size="small" />
              </Tooltip>
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

export default CustomerPromotionCard;