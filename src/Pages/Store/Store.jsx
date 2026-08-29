import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header, Footer } from "../../Components";
import FeatureAd from "../../Components/Common/Feature_Ad/FeatureAd";
import ProductList from "../../Components/Common/ProductList/ProductList";
import PaginationFilter from "../../Components/Common/PaginationFilter/PaginationFilter";
import axios from "axios";
import { Skeleton, Box } from "@mui/material";

import "./Store.css";

const Store = () => {
  const [products, setProducts] = useState([]);
  const { storeId } = useParams();
  const [store, setStore] = useState();
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Use Promise.all to fetch both store and product data concurrently
    Promise.all([
      // Fetch store products
      axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/store/${storeId}`, {
        headers: { "Content-Type": "application/json" },
      }),
      // Fetch store details
      axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores/${storeId}`, {
        headers: { "Content-Type": "application/json" },
      }),
    ])
      .then(([productsResponse, storeResponse]) => {
        setProducts(productsResponse.data);
        setStore(storeResponse.data);
      })
      .catch((error) => {
        console.error(`Error fetching store ${storeId} data:`, error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [storeId]);

  // Skeleton loading component
  const StoreSkeleton = () => (
    <Box sx={{ width: "100%" }}>
      {/* Store header skeleton */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Skeleton animation="wave" variant="circular" width={50} height={50} sx={{ mr: 2 }} />
        <Skeleton animation="wave" height={40} width="30%" />
      </Box>

      {/* Product count and filter skeleton */}
      <Skeleton animation="wave" height={24} width="40%" sx={{ mb: 2 }} />

      {/* Filter controls skeleton */}
      <Box sx={{ display: "flex", flexWrap: "wrap", mb: 3, gap: 2 }}>
        <Skeleton animation="wave" height={40} width="20%" />
        <Skeleton animation="wave" height={40} width="30%" />
        <Skeleton animation="wave" height={40} width="15%" />
      </Box>

      {/* Products grid skeleton */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Box key={index} sx={{ width: { xs: "100%", sm: "45%", md: "22%" }, mb: 3 }}>
              <Skeleton animation="wave" variant="rectangular" height={180} sx={{ mb: 1 }} />
              <Skeleton animation="wave" height={24} width="80%" sx={{ mb: 0.5 }} />
              <Skeleton animation="wave" height={20} width="50%" sx={{ mb: 0.5 }} />
              <Skeleton animation="wave" height={30} width="40%" />
            </Box>
          ))}
      </Box>

      {/* Pagination controls skeleton */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Skeleton animation="wave" height={36} width={100} sx={{ mr: 1 }} />
        <Skeleton animation="wave" height={36} width={40} sx={{ mr: 1 }} />
        <Skeleton animation="wave" height={36} width={40} sx={{ mr: 1 }} />
        <Skeleton animation="wave" height={36} width={40} sx={{ mr: 1 }} />
        <Skeleton animation="wave" height={36} width={100} />
      </Box>
    </Box>
  );

  return (
    <div className="store">
      <Header />
      <div className="store-content">
        <header className="products__header container">
          {!loading && store?.name && (
            <h2 className="subtitle subtitle--products">
              <div className="store-logo">
                <img src="/Images/prop_image/store-icon.svg" alt={`${store.name} logo`} />
              </div>
              {store.name}
            </h2>
          )}
        </header>

        <div className="container">
          {loading ? (
            <StoreSkeleton />
          ) : (
            <PaginationFilter items={products} showOnSaleFilter={true}>
              {(currentItems, filteredCount, paginationControls) => (
                <>
                  <p className="cart-item-count reduce-mb">
                    We found
                    <span className="item-count-number"> {filteredCount} </span>
                    items for you!
                  </p>
                  {paginationControls}
                  <ProductList products={currentItems} storeId={storeId} size="small" />
                </>
              )}
            </PaginationFilter>
          )}
        </div>
      </div>
      <FeatureAd />
      <Footer />
    </div>
  );
};

export default Store;
