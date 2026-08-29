import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header, Footer } from "../../Components";
import FeatureAd from "../../Components/Common/Feature_Ad/FeatureAd";
import ProductList from "../../Components/Common/ProductList/ProductList";
import PaginationFilter from "../../Components/Common/PaginationFilter/PaginationFilter";
import "./Category.css";
import axios from "axios";
import { Skeleton, Box } from "@mui/material";

const Category = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch category-specific data from JSON file based on categoryName
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/category/${categoryName}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        return response.data;
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => console.error(`Error fetching ${categoryName} data:`, error))
      .finally(() => setLoading(false));
  }, [categoryName]);

  // Skeleton loading component
  const CategorySkeleton = () => (
    <Box sx={{ width: "100%" }}>
      <Skeleton animation="wave" height={60} width="40%" sx={{ mb: 2 }} />
      <Skeleton animation="wave" height={30} width="60%" sx={{ mb: 3 }} />
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
    </Box>
  );

  return (
    <div className="category">
      <Header />
      <div className="category-content">
        <header className="products__header container">
          <h2 className="subtitle subtitle--products">{categoryName} category</h2>
        </header>

        <div className="container">
          {loading ? (
            <CategorySkeleton />
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
                  <ProductList products={currentItems} storeId={null} size="small" />
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

export default Category;
