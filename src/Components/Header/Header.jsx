// src/Components/Header/Header.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth hook
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import "./Header.css";

const Header = () => {
  const { state } = useCart();
  const { user } = useAuth(); // Access user from useAuth
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="header">
      <nav>
        <Link to="/" className={getNavItemClass("/")}>
          <img src="/Images/logo.png" alt="logo-shophouse" className="nav__logo" />
        </Link>
        <div className="header-with-search__search-section">
          <div className="search_body">
            <div className="search-container">
              <input type="text" className="search-input" id="searchInput" placeholder="Search..." />
              <button className="search-button">
                <SearchIcon />
              </button>
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