import React, { useEffect, useRef, useState } from "react";
import { Header, Footer, ShowProduct, StoreCard } from "../../Components";
import FeatureAd from "../../Components/Common/Feature_Ad/FeatureAd";
import ProductList from "../../Components/Common/ProductList/ProductList";

import PaginationFilter from "../../Components/Common/PaginationFilter/PaginationFilter";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [currentAd, setCurrentAd] = useState(1);
  const [stores, setStores] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [currentTopProductIndex, setCurrentTopProductIndex] = useState(0);
  const [storesIsVisible, setStoresIsVisible] = useState(true);
  const [categoriesIsVisible, setCategoriesIsVisible] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filteredPromoCount, setFilteredPromoCount] = useState(0);
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0);

  const handleNextCategoryPage = () => {
    setCurrentCategoryPage((prevPage) => prevPage + 1);
  };

  const handlePrevCategoryPage = () => {
    setCurrentCategoryPage((prevPage) => prevPage - 1);
  };

  useEffect(() => {
    setCurrentCategoryPage(0);
  }, [categories]);

  const toggleStoresVisibility = () => {
    setStoresIsVisible(!storesIsVisible);
  };

  const toggleCategoriesVisibility = () => {
    setCategoriesIsVisible(!categoriesIsVisible);
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
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores/`, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => setStores(response.data))
      .catch((error) => console.error(`Error fetching store data:`, error));
  }, []);

  // Fetch promo products
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/promotion/`, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        console.log("Product Data Sample:", response.data[0]);
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
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/top5products/2025`, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        const productPromises = response.data.map((product) =>
          axios.get(
            `${import.meta.env.VITE_REACT_APP_API_URL}/products/product/${product.productID}`,
            {
              headers: { "Content-Type": "application/json" },
            },
          ),
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
          .catch((error) => console.error("Error fetching product information:", error));
      })
      .catch((error) => console.error("Error fetching store data:", error));
  }, []);

  // Fetch categories
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/category`, {
        headers: { Accept: "*/*" },
      })
      .then((response) => {
        console.log("Category Data Sample:", response.data[0]);
        setCategories(response.data);
      })
      .catch((error) => console.error(`Error fetching category data:`, error));
  }, []);

  // Top products rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTopProductIndex((prevIndex) => (prevIndex + 1) % topProducts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [topProducts]);

  // Map categories to Font Awesome icons
  const categoryIcons = {
    Condiments: "fa-pepper-hot",
    Refrigerated: "fa-snowflake",
    "Gluten Free": "fa-solid fa-wheat-slash",
    Baking: "fa-cookie-bite",
    "Sweet Snacks": "fa-candy-cane",
    Gourmet: "fa-utensils",
    "Health Foods": "fa-heart-pulse",
    Frozen: "fa-icicles",
    "Oil, Vinegar, Salad Dressing": "fa-oil-can",
    Bread: "fa-bread-slice",
    Cereal: "fa-bowl-food",
    "Dried Fruits": "fa-leaf",
    "Pasta and Rice": "fa-spaghetti",
    Ethnic: "fa-globe",
    "Milk, Eggs, Other Dairy": "fa-egg",
    "Nut butters, Jams, and Honey": "fa-jar",
    "Savory Snacks": "fa-chips",
    Beverages: "fa-mug-hot",
    Meat: "fa-drumstick-bite",
    Cheese: "fa-cheese",
    "Tea and Coffee": "fa-coffee",
    Seafood: "fa-fish",
    "Spices and Seasonings": "fa-mortar-pestle",
    "Not in Grocery Store/Homemade": "fa-house",
    Produce: "fa-carrot",
    "Alcoholic Beverages": "fa-wine-glass",
    Nuts: "fa-seedling",
    "Bakery/Bread": "fa-croissant",
    "Ethnic Foods": "fa-pepper-hot",
    "Canned and Jarred": "fa-can",
  };

  // Function to truncate category name to 15 characters with ellipsis
  const truncateCategoryName = (name) => {
    if (name.length > 10) {
      return name.substring(0, 10) + "...";
    }
    return name;
  };

  // Helper function to generate category image paths
  const getCategoryImagePath = (category) => {
    // Replace slashes with spaces, keep all other characters (including spaces, commas, etc.)
    const normalizedName = category.replace(/\//g, " ");
    // Return the image path with .webp extension
    return `/Images/category/${normalizedName}.png`;
  };

  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const heroRef = useRef(null);

  // Set up Intersection Observer for hero section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHeroVisible(true);
          // Once we've seen it, no need to keep observing
          observer.disconnect();
        }
      },
      {
        threshold: 0.15, // Trigger when 15% of the component is visible
        rootMargin: "0px 0px -50px 0px", // Adjust trigger point slightly
      },
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div className="home">
      <Header />
      <div className="content-section">
        <section className="hero" ref={heroRef}>
          <div className="hero__content">
            <img
              src="/Images/logo.png"
              alt="Shop house logo"
              className="hero__logo"
              style={{
                animation: isHeroVisible ? `fadeInDown 0.8s ease forwards` : "none",
                opacity: 0,
              }}
            />
            <p
              className="hero__text"
              style={{
                animation: isHeroVisible ? `fadeInUp 0.8s ease forwards 0.2s` : "none",
                opacity: 0,
              }}
            >
              Over 30 years of experience giving our customers the products at the best price.
            </p>
            <button
              className="btn btn--black btn--hero"
              style={{
                animation: isHeroVisible ? `fadeInUp 0.8s ease forwards 0.4s` : "none",
                opacity: 0,
              }}
            >
              Explore Our Products
            </button>
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
                  style={{ display: index === currentTopProductIndex ? "block" : "none" }}
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
            itemsPerPage={25}
          >
            {(currentItems, filteredCount, paginationControls) => (
              <>
                {paginationControls}
                <ProductList products={currentItems} />
              </>
            )}
          </PaginationFilter>
        </div>

        <div className="categories">
          <h2
            className={`category--cat ${categoriesIsVisible ? "active" : ""}`}
            onClick={toggleCategoriesVisibility}
          >
            OUR CATEGORIES <span className={`arrow ${categoriesIsVisible ? "up" : "down"}`}>➔</span>
          </h2>
          {categoriesIsVisible && (
            <div className="categories-container">
              <button
                className={`prev-button ${currentCategoryPage === 0 ? "disabled" : ""}`}
                onClick={handlePrevCategoryPage}
                disabled={currentCategoryPage === 0}
              >
                ◄
              </button>
              <div className="category-slider">
                {categories
                  .slice(currentCategoryPage * 11, (currentCategoryPage + 1) * 11)
                  .map((category, index) => (
                    <Link
                      to={`/Category/${encodeURIComponent(category)}`}
                      key={index}
                      className="category-card"
                    >
                      <div className="category-card__image">
                        <img
                          src={getCategoryImagePath(category)}
                          alt={category}
                          loading="lazy"
                          onError={(e) => (e.target.src = "/Images/categories/default.png")}
                        />
                      </div>
                      <div className="category-card__content">
                        <h3 className="category-card__name">{truncateCategoryName(category)}</h3>
                        <p className="category-card__count">Browse now</p>
                      </div>
                    </Link>
                  ))}
              </div>
              <button
                className={`next-button ${categories.length <= (currentCategoryPage + 1) * 11 ? "disabled" : ""}`}
                onClick={handleNextCategoryPage}
                disabled={categories.length <= (currentCategoryPage + 1) * 11}
              >
                ►
              </button>
            </div>
          )}
        </div>

        {/* Stores section */}
        <div className="stores">
          <h2
            className={`store--cat ${storesIsVisible ? "active" : ""}`}
            onClick={toggleStoresVisibility}
          >
            OUR STORES <span className={`arrow ${storesIsVisible ? "up" : "down"}`}>➔</span>
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
