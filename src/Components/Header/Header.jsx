// src/Components/Header/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth hook
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import "./Header.css";

const Header = () => {
  const { state } = useCart();
  const { user } = useAuth(); // Access user from useAuth
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const products = ['Tomato Pasta Sauce', 'Crab Legs', 'Pork Belly', 'Pork Loin', 'Pork Chops', 'Pork Ribs', 'Ground Pork', 'Ground Beef', 'Beef Brisket', 'Beef Ribeye', 'Beef Tenderloin', 'Beef Stew Meat', 'Salmon Fillet', 'Shrimp', 'Scallops', 'Cod', 'Whole Milk', 'Skim Milk', 'Almond Milk', 'Oranges', 'Soy Milk', 'Coconut Milk', 'Black Pepper', 'Cinnamon', 'Paprika', 'Turmeric', 'Cumin', 'Spinach', 'Carrots', 'Broccoli', 'Bell Peppers', 'Tomatoes', 'Tomato Sauce', 'Soy Sauce', 'Hot Sauce', 'BBQ Sauce', 'Fish Sauce', 'Bananas', 'Grapes', 'Strawberries', 'Quinoa', 'Barley', 'Oats', 'Wheat Flour', 'Apples', 'Rice']

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
  
    if (value.trim() === "") {
      setFilteredProducts([]);
      return;
    }
  
    const filtered = products
      .filter((product) => {
        // Check if the search term matches any part of the product name
        return product
          .toLowerCase()
          .split(" ")
          .some((word) => word.startsWith(value.trim())) || product.toLowerCase().includes(value.trim());
      })
      .slice(0, 4); // Limit to the first 4 matches
  
    setFilteredProducts(filtered);
  };
  
  const handleProductSelect = async (product) => {
    try {
      // Call API 1: Get product details by name
      console.log("Product selected:", product);
      const response1 = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/products/chatbot`, [product],{
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Product details:", response1.data);
      const productId = response1.data[0].productID;
        console.log("Product ID:", productId);
      // Call API 2: Get product store information by product ID
      const response2 = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/${productId}`,{
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const storeId = response2.data[0].storeID;

      // Navigate to the product's store page
      window.location.href = `/buy-product/${productId}/${storeId}`;
    } catch (error) {
      console.error("Error fetching product or store information:", error);
    }
  };
  
  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: 10,
      top: 25,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }));

  const location = useLocation();

  const getNavItemClass = (pathname) => {
    return location.pathname === pathname ? "navbar-item current-page" : "navbar-item";
  };

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
    document.body.classList.toggle("body__fixed", !isMenuOpen); // Prevent body scroll when menu is open
  };

  useEffect(() => {
    setIsMenuOpen(false);
    document.body.classList.remove("body__fixed");
  }, [location.pathname]);

  return (
    <div className="header">
      <nav>
        <Link to="/" className="navbar-item home_logo">
          <img src="/Images/logo.png" alt="logo-shophouse" className="nav__logo" />
        </Link>
        <div className="header-with-search__search-section">
          <div className="search_body">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                id="searchInput"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleInputChange}
              />
              <button className="search-button">
                <SearchIcon />
              </button>
              {filteredProducts.length > 0 && (
            <div className="dropdown">
              {filteredProducts.map((product, index) => (
                <a
                  key={index}
                  onClick={() => handleProductSelect(product)} // Call handleProductSelect on click
                  className="dropdown-item"
                >
                  {product}
                </a>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
        <ul className={`nav__navigation ${isMenuOpen ? "nav__navigation_visible" : ""}`}>
          <Link to="/" className={getNavItemClass("/")}>
            <p className="a__navbar btn btn--primary">HOME</p>
          </Link>
          <Link to="/AboutUs" className={getNavItemClass("/AboutUs")}>
            <p className="a__navbar btn btn--primary">ABOUT US</p>
          </Link>
          <Link to="/Chat" className={getNavItemClass("/Chat")}>
            <p className="a__navbar btn btn--primary">CHATBOT</p>
          </Link>
          <Link to="/Cart" className={getNavItemClass("/Cart")}>
            {state.cart.length > 0 ? (
              <StyledBadge badgeContent={state.cart.length} color="secondary">
                <p className="a__navbar btn btn--primary">MY CART</p>
              </StyledBadge>
            ) : (
              <p className="a__navbar btn btn--primary">MY CART</p>
            )}
          </Link>
          {!user && (
            <Link to="/Login" className={getNavItemClass("/Login")}>
              <p className="a__navbar btn btn--primary">LOGIN</p>
            </Link>
          )}
          {user && (
            <Link to="/Profile" className={getNavItemClass("/Profile")}>
              <p className="a__navbar btn btn--primary">PROFILE</p>
            </Link>
          )}
        </ul>
        <i className="fa fa-bars wrap-menu" onClick={toggleMenu} aria-label="Open menu"></i>
      </nav>
    </div>
  );
};

export default Header;