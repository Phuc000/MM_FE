// src/components/Promotions.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { Card, Typography, Box, Stack, Chip, Tooltip } from '@mui/material';
import "./Promotions.scss";

const Promotions = () => {
  const { user } = useAuth();
  const [billPromotions, setBillPromotions] = useState([]);
  const [productPromotions, setProductPromotions] = useState([]);
  const [customerPromotions, setCustomerPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBillPromotions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/bill`
      );
      // console.log('Bill Promotions:', response.data);
      setBillPromotions(response.data);
    } catch (error) {
      console.error("Error fetching bill promotions:", error);
    }
  };

  const fetchProductPromotions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/product`
      );
      setProductPromotions(response.data);
    } catch (error) {
      console.error("Error fetching product promotions:", error);
    }
  };

  const fetchCustomerPromotions = async (customerId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer/${customerId}`
      );
      setCustomerPromotions(response.data);
    } catch (error) {
      console.error("Error fetching customer promotions:", error);
    }
  };

  useEffect(() => {
    const initializePromotions = async () => {
      setLoading(true);
      await fetchBillPromotions();
      await fetchProductPromotions();
      if (user && user.role === "Customer") {
        await fetchCustomerPromotions(user.id); // Adjust 'user.id' based on your user object structure
      }
      setLoading(false);
    };
    initializePromotions();
  }, [user]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="promotion-container">
      <h1 className="promotion-title">Promotions</h1>
      <p className="promotion-subtitle">Check out our latest promotions!</p>

      {loading ? (
        <p>Loading promotions...</p>
      ) : (
        <>
          {/* Bill Promotions */}
          <div className="promo-section">
            <div className="promo-list-title">Bill Promotions</div>
            {billPromotions.length > 0 ? (
              <Box className="promo-list" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {billPromotions.map((promo) => (
                  <Card
                    key={promo.promotionId}
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
                      <Typography variant="body2" sx={{ color: '#555', marginBottom: 1 }}>
                        <strong>Limited:</strong> only {promo.promotionChance} times left!
                      </Typography>
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
                      {/* Top Cutout */}
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
                      {/* Bottom Cutout */}
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
                ))}
              </Box>
            ) : (
              <p>No bill promotions available at the moment.</p>
            )}
          </div>

          {/* Product Promotions */}
          <div className="promo-section">
            <div className="promo-list-title">Product Promotions</div>
            {productPromotions.length > 0 ? (
              <Box className="promo-list" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {productPromotions.map((promo) => (
                  <Card
                    key={promo.promotionID}
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
                      {/* Applicable Products */}
                      {promo.products && promo.products.length > 0 && (
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          sx={{ 
                            marginTop: 1,
                            flexWrap: 'wrap',
                          }}>
                          {promo.products.map((product) => (
                            <Tooltip
                              key={product.productID}
                              title={product.pName}
                            >
                              <Chip label={product.pName} />
                            </Tooltip>
                          ))}
                        </Stack>
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
                      {/* Top Cutout */}
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
                      {/* Bottom Cutout */}
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
                ))}
              </Box>
            ) : (
              <p>No product promotions available at the moment.</p>
            )}
          </div>

          {/* Customer Promotions */}
          {user && user.role === "Customer" && (
            customerPromotions.length > 0 ? (
              <div className="promo-section">
                <div className="promo-list-title">Your Promotions</div>
                <Box className="promo-list" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {customerPromotions.map((promo) => (
                    <Card
                      key={promo.promotionId}
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
                        {/* Product Details */}
                        {promo.product && (
                          <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
                            <Tooltip
                              key={promo.product.productID}
                              title={promo.product.pName}
                            >
                              <Chip label={promo.product.pName} />
                            </Tooltip>
                          </Stack>
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
                        {/* Top Cutout */}
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
                        {/* Bottom Cutout */}
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
                  ))}
                </Box>
              </div>
            ) : (
              <div className="promo-section">
                <div className="promo-list-title">Your Promotions</div>
                <p>No promotions available for you at the moment.</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

export default Promotions;