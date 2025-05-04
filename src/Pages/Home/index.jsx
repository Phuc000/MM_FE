import React, { useEffect, useState } from 'react';
import { Header, Footer, ShowProduct, StoreCard } from "../../Components";
import FeatureAd from '../../Components/Common/Feature_Ad/FeatureAd';
import ProductList from '../../Components/Common/ProductList/ProductList';
import PaginationFilter from '../../Components/Common/PaginationFilter/PaginationFilter';
import axios from "axios";
import "./Home.css";

const Home = () => {
  const [currentAd, setCurrentAd] = useState(1);
  const [stores, setStores] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [currentTopProductIndex, setCurrentTopProductIndex] = useState(0);
  const [storesIsVisible, setStoresIsVisible] = useState(true);

  const [filteredPromoCount, setFilteredPromoCount] = useState(0);

  const toggleStoresVisibility = () => {
    setStoresIsVisible(!storesIsVisible);
  };

  // Filter handler
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      if (filterType === 'aisle') {
        newFilters.aisle = value;
      } else if (filterType === 'priceMin') {
        newFilters.priceRange.min = value;
      } else if (filterType === 'priceMax') {
        newFilters.priceRange.max = value;
      }
      return newFilters;
    });
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  // Ad rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prevAd) => (prevAd % 4) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stores
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores/`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => setStores(response.data))
      .catch((error) => console.error(`Error fetching store data:`, error));
  }, []);

  // Fetch promo products
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/promotion/`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        console.log('Product Data Sample:', response.data[0]);
        const uniqueProducts = response.data.reduce((unique, product) => {
          if (!unique.find((p) => p.productID === product.productID)) {
            return [...unique, product];
          }
          return unique;
        }, []);
        setPromoProducts(uniqueProducts);
      })
      .catch((error) => console.error(`Error fetching store data:`, error));
  }, []);

  // Fetch top products
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/top5products/2025`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        const productPromises = response.data.map((product) =>
          axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/product/${product.productID}`, {
            headers: { 'Content-Type': 'application/json' },
          })
        );
        Promise.all(productPromises)
          .then((productResponses) => {
            const productsData = productResponses.map((productResponse) => productResponse.data);
            const combinedData = response.data.map((product, index) => ({
              ...product,
              ...productsData[index],
            }));
            setTopProducts(combinedData);
          })
          .catch((error) => console.error('Error fetching product information:', error));
      })
      .catch((error) => console.error('Error fetching store data:', error));
  }, []);

  // Top products rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTopProductIndex((prevIndex) => (prevIndex + 1) % topProducts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [topProducts]);

  return (
    <div className="home">
      <Header />
      <div className="content-section">
        <section className="hero">
          <div className="hero__content">
            <img src="/Images/logo.png" alt="Shop house logo" className="hero__logo" />
            <p className="hero__text">
              Over 30 years of experience giving our customers the products at the best price.
            </p>
            <button className="btn btn--black btn--hero">Explore Our Products</button>
          </div>
        </section>
        <br />
        <section className="bannerblock">
          <div className="banner-wrapper">
            <h2 className="promo-products-title">Our Top Products</h2>
            <div className="promo-products-container">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="top-item"
                  style={{ display: index === currentTopProductIndex ? 'block' : 'none' }}
                >
                  <ShowProduct product={product} storeId={null} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="promo-products">
          <h2 className="promo-products-title">Featured Promotion Products</h2>
          <PaginationFilter 
            items={promoProducts}
            onFilteredItemsChange={(filteredItems) => setFilteredPromoCount(filteredItems.length)}
          >
            {(currentItems, filteredCount, paginationControls) => (
              <>
                {paginationControls}
                <ProductList products={currentItems} />
              </>
            )}
          </PaginationFilter>
        </div>

        {/* Stores section unchanged */}
        <div className="stores">
          <h2
            className={`store--cat ${storesIsVisible ? 'active' : ''}`}
            onClick={toggleStoresVisibility}
          >
            OUR STORES <span className={`arrow ${storesIsVisible ? 'up' : 'down'}`}>➔</span>
          </h2>
          {storesIsVisible && (
            <div className="stores-container">
              {stores.map((store) => (
                <StoreCard store={store} key={store.storeID} />
              ))}
            </div>
          )}
        </div>
      </div>
      <FeatureAd />
      <Footer />
    </div>
  );
};

export default Home;