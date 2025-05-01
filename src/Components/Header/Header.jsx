// src/Components/Header/Header.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth hook
import { useLocationContext } from "../../Context/LocationContext";
import LocationSelector from "../Modal/LocationSelector";

// import Badge from '@mui/material/Badge';
// import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Import Location Icon
import { Box, Typography} from '@mui/material';
import "./Header.css";

import debounce from "lodash.debounce";

const Header = () => {
  const { user } = useAuth(); // Access user from useAuth
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { location } = useLocationContext();
  const [showSelector, setShowSelector] = useState(false);

  // useEffect(() => {
  //   console.log("Location context:", location);
  //   if (!location) {
  //     setShowSelector(true);
  //   }
  // }, [location]);

  // const products = ['Tomato Pasta Sauce', 'Crab Legs', 'Pork Belly', 'Pork Loin', 'Pork Chops', 'Pork Ribs', 'Ground Pork', 'Ground Beef', 'Beef Brisket', 'Beef Ribeye', 'Beef Tenderloin', 'Beef Stew Meat', 'Salmon Fillet', 'Shrimp', 'Scallops', 'Cod', 'Whole Milk', 'Skim Milk', 'Almond Milk', 'Oranges', 'Soy Milk', 'Coconut Milk', 'Black Pepper', 'Cinnamon', 'Paprika', 'Turmeric', 'Cumin', 'Spinach', 'Carrots', 'Broccoli', 'Bell Peppers', 'Tomatoes', 'Tomato Sauce', 'Soy Sauce', 'Hot Sauce', 'BBQ Sauce', 'Fish Sauce', 'Bananas', 'Grapes', 'Strawberries', 'Quinoa', 'Barley', 'Oats', 'Wheat Flour', 'Apples', 'Rice']

  // const [searchTerm, setSearchTerm] = useState("");
  // const [filteredProducts, setFilteredProducts] = useState([]);

  // const handleInputChange = (e) => {
  //   const value = e.target.value.toLowerCase();
  //   setSearchTerm(value);
  
  //   if (value.trim() === "") {
  //     setFilteredProducts([]);
  //     return;
  //   }
  
  //   const filtered = products
  //     .filter((product) => {
  //       // Check if the search term matches any part of the product name
  //       return product
  //         .toLowerCase()
  //         .split(" ")
  //         .some((word) => word.startsWith(value.trim())) || product.toLowerCase().includes(value.trim());
  //     })
  //     .slice(0, 4); // Limit to the first 4 matches
  
  //   setFilteredProducts(filtered);
  // };
  
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
  
  // const StyledBadge = styled(Badge)(({ theme }) => ({
  //   '& .MuiBadge-badge': {
  //     right: 10,
  //     top: 25,
  //     border: `2px solid ${theme.palette.background.paper}`,
  //     padding: '0 4px',
  //   },
  // }));


  // Test here
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Debounced function to handle API call
  const fetchSuggestions = debounce(async (searchText) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/search`, {
        params: { query: searchText },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error("Autocomplete failed:", error);
    }
  }, 500); // Wait for 300ms after the user stops typing

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  // End test here
  const page_location = useLocation();

  const getNavItemClass = (pathname) => {
    return page_location.pathname === pathname ? "navbar-item current-page" : "navbar-item";
  };

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
    document.body.classList.toggle("body__fixed", !isMenuOpen); // Prevent body scroll when menu is open
  };

  useEffect(() => {
    setIsMenuOpen(false);
    document.body.classList.remove("body__fixed");
  }, [page_location.pathname]);

  return (
    <div className="header">
      <nav>
        <LocationSelector
          open={showSelector} 
          onClose={() => setShowSelector(false)} 
        />

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
                value={query}
                onChange={handleInputChange}
              />
              <button className="search-button">
                <SearchIcon />
              </button>
              {suggestions.length > 0 && (
            <div className="dropdown">
              {suggestions.map((product, index) => (
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
  <Link
    to="/MealPlanner"
    className={`a__navbar btn btn--primary ${getNavItemClass("/MealPlanner")}`}
  >
    MEAL PLANNER
  </Link>

  <Link
    to="/Chat"
    className={`a__navbar btn btn--primary ${getNavItemClass("/Chat")}`}
  >
    CHATBOT
  </Link>

  <Link
    to="/Cart"
    className={`a__navbar btn btn--primary ${getNavItemClass("/Cart")}`}
  >
    MY CART
  </Link>

  {!user && (
    <Link
      to="/Login"
      className={`a__navbar btn btn--primary ${getNavItemClass("/Login")}`}
    >
      LOGIN
    </Link>
  )}

  {user && (
    <Link
      to="/Profile"
      className={`a__navbar btn btn--primary ${getNavItemClass("/Profile")}`}
    >
      PROFILE
    </Link>
  )}
</ul>
        <i className="fa fa-bars wrap-menu" onClick={toggleMenu} aria-label="Open menu"></i>
      </nav>
      <div className="secondary-header">
        <Box
          display="flex"
          alignItems="center"
          justifyContent={{ xs: "center", sm: "space-between" }}
          width="100%"
          flexWrap="wrap"
          sx={{ padding: { xs: '10px', sm: '20px' }}}
        >
          <Box sx={{marginBottom: { xs: '5px', sm: 0} }} display="flex" alignItems="center" gap={3}>
            <Link to="/" className={getNavItemClass("/")}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 900,
                  fontFamily: 'Quicksand, sans-serif',
                  transition: 'color 0.3s',
                  color: 'rgb(24, 40, 51)',
                  '&:hover': {
                    color: '#fe3bd4',
                  },
                }}
              >
                Home
              </Typography>
            </Link>
            <Link to="/AboutUs" className={getNavItemClass("/AboutUs")}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 900,
                  fontFamily: 'Quicksand, sans-serif',
                  transition: 'color 0.3s',
                  color: 'rgb(24, 40, 51)',
                  '&:hover': {
                    color: '#fe3bd4',
                  },
                }}
              >
                About Us
              </Typography>
            </Link>
            <Link to="/RecipesArticles" className={getNavItemClass("/RecipesArticles")}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 900,
                  fontFamily: 'Quicksand, sans-serif',
                  transition: 'color 0.3s',
                  color: 'rgb(24, 40, 51)',
                  '&:hover': {
                    color: '#fe3bd4',
                  },
                }}
              >
                Recipes Articles
              </Typography>
            </Link>
            {/* <Link to="/MealPlanner" className={getNavItemClass("/MealPlanner")}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 900,
                  fontFamily: 'Quicksand, sans-serif',
                  transition: 'color 0.3s',
                  color: 'rgb(24, 40, 51)',
                  '&:hover': {
                    color: '#fe3bd4',
                  },
                }}
              >
                Meal Planner
              </Typography>
            </Link> */}
          </Box>
          {/* User current location on the right with MUI styling */}
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="flex-end" 
            sx={{ cursor: 'pointer', pr: { xs: 1, sm: 2 } }} 
            onClick={() => setShowSelector(true)} // Open Location Selector on click
            aria-label="Change Location"
          >
            <LocationOnIcon color="primary" />
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 900, 
                fontFamily: 'Quicksand, sans-serif',
                ml: 1 
              }}
            >
              {location?.ward.name}, {location?.city.name}
            </Typography>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default Header;