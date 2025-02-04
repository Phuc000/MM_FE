import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {Header, Footer, ShowProduct, StoreCard } from "../../Components";
import FeatureAd from '../../Components/Common/Feature_Ad/FeatureAd';
import ProductList from '../../Components/Common/ProductList/ProductList';
import axios from "axios";
import "./Home.css";

const Home = () => {
  const [currentAd, setCurrentAd] = useState(1);
  const [stores, setStores] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [currentTopProductIndex, setCurrentTopProductIndex] = useState(0);

  const [storesIsVisible, setStoresIsVisible] = useState(false);

  const toggleStoresVisibility = () => {
    setStoresIsVisible(!storesIsVisible);
  };

  useEffect(() => {
    const interval = setInterval(() => {
        // Change the ad every 0.5 seconds
        // It is very important to change the ad every 0.5 seconds
        setCurrentAd((prevAd) => (prevAd % 4) + 1);
      }, 2000);

      return () => clearInterval(interval);
    }, []);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
      // Fetch categories from your JSON file or backend API
      fetch("/assets/categories.json")
        .then((response) => response.json())
        .then((data) => setCategories(data))
        .catch((error) => console.error("Error fetching categories:", error));
    }, []);

    useEffect(() => {
      axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          setStores(data);
        })
        .catch((error) => console.error(`Error fetching store data:`, error));
    }, []);

    useEffect(() => {
      axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/promotion/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          // console.log('Fetched Data:', data);
          const uniqueProducts = data.reduce((unique, product) => {
            if (!unique.find((p) => p.productID === product.productID)) {
              return [...unique, product];
            }
            return unique;
          }, []);
          setPromoProducts(uniqueProducts);
        })
        .catch((error) => console.error(`Error fetching store data:`, error));
    }, []);

    useEffect(() => {
      axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/top5products/2025`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          return response.data;
        })
        .then((data) => {
        // Fetch product information for each product in the top5products/2023 response
        const productPromises = data.map((product) =>
          axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/product/${product.productID}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );

        // Wait for all product information requests to complete
        Promise.all(productPromises)
          .then((productResponses) => {
            // Extract product information from each response
            const productsData = productResponses.map((productResponse) => productResponse.data);

            // Combine the product information with the revenue data
            const combinedData = data.map((product, index) => ({
              ...product,
              ...productsData[index],
            }));

            // console.log(combinedData);
            // Set the combined data in the state
            setTopProducts(combinedData);
          })
          .catch((error) => console.error('Error fetching product information:', error));
      })
      .catch((error) => console.error('Error fetching store data:', error));
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
        // Change the top product every 2 seconds
        setCurrentTopProductIndex((prevIndex) => (prevIndex + 1) % topProducts.length);
      }, 3000);
  
      return () => clearInterval(interval);
    }, [topProducts]);
  
    return (
    <div className="home">
      <Header/>
      <div className="content-section">

        <section className="hero">
            <div className="hero__content">
                <img src="/Images/logo.png" alt="Shop house logo" className="hero__logo" />
                <p className="hero__text">
                    Over 30 years of experience giving our customers the products at the best price.
                </p>
                <a href="#catContainer"><button className="btn btn--black btn--hero">Take a look of our categories</button></a>
            </div>
        </section>
        <br/>
        <section className="bannerblock">
          <div className='banner-wrapper'>
            <h2 className="promo-products-title">Our Top Products</h2>
            {/* <div className='banner-wrapper'> */}
            <div className="promo-products-container ">
            {topProducts.map((product, index) => (
                <div 
                  key={index} className='top-item' 
                  style={{  
                    // opacity: index === currentTopProductIndex ? 1 : 0,
                    // width: index === currentTopProductIndex ? '100%' : '0',
                    display: index === currentTopProductIndex ? 'block' : 'none',
                   }}>
                  {/* Show the current top product */}
                  <ShowProduct product={product} storeId={null} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="promo-products">
          <h2 className="promo-products-title">Featured Promotion Products</h2>
          {/* <div className="promo-products-container">
            {promoProducts.map((product) => (
              <>
              <ShowProduct product={product} storeId={null} />
              </>
            ))}
          </div> */}

          <ProductList products={promoProducts} />
        </div>
        
        {/* Display stores horizontally */}
        <div className='stores'>
          <h2 className={`store--cat ${storesIsVisible ? 'active' : ''}`} onClick={toggleStoresVisibility}>
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

        <div className="catContainer container" id="catContainer">
          <section className="bannerCategories">
            <h2 className="subtitle subtitle--cat">OUR CATEGORIES</h2>
          </section>
          <div className="circlesContainer">
            {categories.map((category) => (
              <div className="circle" key={category.name}>
                <Link to={`/Category/${category.name}`}>
                  <img src={category.image} className="imgRounded" alt={category.name} />
                </Link>
                <div className="circleBody">
                  <Link to={`/Category/${category.name}`} className="a__catContainer">
                    <h3 className="descripCateg">{category.name}</h3>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FeatureAd />
      <Footer/>
    </div>
  );
};

export default Home;
