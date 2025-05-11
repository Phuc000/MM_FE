// src/Pages/Cart/Cart.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Footer, Title, CartSummary } from '../../Components';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth
import PromotionTicket from '../../Components/Common/PromotionTicket/PromotionTicket';

import { Typography } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'; // Import axios for making HTTP requests
import './Cart.css';
import './Style.scss';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, discountAmount: 0, total: 0 });
  const { user } = useAuth(); // Get user from context
  const navigate = useNavigate(); // For navigation after purchase
  const [customerPromotions, setCustomerPromotions] = useState([]);
  const [selectedCustomerPromotions, setSelectedCustomerPromotions] = useState([]);
  const [amountDiscount, setAmountDiscount] = useState([]);
  // const customerId = user?.role === 'Customer' ? user.id : null; // Get customerId if user is a customer

  // Check for valid user role or redirect to Login
  useEffect(() => {
    
    const validateUserAndNavigate = async () => {
      if (!user || user.role !== "Customer") {
        navigate("/Login");
        return; // Return early to avoid executing further code
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/cart/checkout/${user.id}`
        );
        if (response.data === true) {
          navigate("/CheckOut");
        } else {
          console.log("CAll here"); 
          await fetchCart(user.id);
        }
      } catch (error) {
        console.error("Error during checkout navigation:", error);
        // Optionally handle error or show a message to the user
      }
    };

    validateUserAndNavigate();
  }, []);

  const fetchCart = async (customerId) => {
    try {
      // Step 1: Get cart items and selected promotion for the customer
      const cartResponse = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/cart/${customerId}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log("Cart Response:", cartResponse.data);
      
      const cartItems = cartResponse.data.cart.cartItems;
      const selectedPromotions = cartResponse.data.selectedPromotions;
  
      // Update cart state
      setCart(cartItems);
      setSelectedCustomerPromotions(selectedPromotions); // Set the already selected customer promotions
      calculateTotals(cartItems, selectedPromotions);
  
      console.log("Check cart:", cartItems);
      console.log("Check selected promotions:", selectedPromotions);
  
      // Step 2: Get all customer promotions for the products in the cart
      const productIdList = cartItems.map((item) => item.productID);
      console.log("Product ID List:", productIdList);
  
      const promotionResponse = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer/product`,
        productIdList, // Send the array
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      setCustomerPromotions(promotionResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  const handleRemoveItem = async (productId, storeId, discountedPrice, quantity) => {
    // Remove item from cart
    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/cart/remove/${user.id}/${productId}/${storeId}/${discountedPrice}/${quantity}`
      );
      var newCart = cart.filter((item) => item.productID !== productId);
      setCart(newCart);
      // Remove selected promotions if they match the product being removed
      console.log("Selected Promotions:", selectedCustomerPromotions);
      let removedSelectedPromotions = [];
      let removedIndicesSet = new Set();

      // Filter promotions and build the indices set in a single pass
      selectedCustomerPromotions.forEach((promotion, index) => {
        if (promotion.product.productId === productId) {
          removedSelectedPromotions.push(promotion);  // Collect matching promotions
          removedIndicesSet.add(index);  // Track the index of the removed promotion
        }
      });

      // Filter out the elements in amountDiscount using the indices set
      let updatedAmountDiscount = amountDiscount.filter((_, index) => !removedIndicesSet.has(index));

      // Update the state with the new amountDiscount array
      setAmountDiscount(updatedAmountDiscount);
      console.log("Removed Selected Promotions:", removedSelectedPromotions);
      var response = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/cart/remove-select-promotion/${user.id}`, removedSelectedPromotions, { headers: { 'Content-Type': 'application/json' } });
      setSelectedCustomerPromotions(response.data);
      let newPromotionList = customerPromotions.filter((promotion) => promotion.product.productId !== productId);
      setCustomerPromotions(newPromotionList);
      console.log("New Customer Promotions:", newPromotionList);

      // Recalculate totals
      calculateTotals(newCart, selectedCustomerPromotions);

      // Toast notification
      toast.success("Item removed from cart.", {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item. Please try again.", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_APP_API_URL}/cart/clear/${user.id}`);
      setCart([]);
      setTotals({ subtotal: 0, discountAmount: 0, total: 0 });
      setCustomerPromotions([]);
      setSelectedCustomerPromotions([]);
      setAmountDiscount([]);
      toast.info("Cart has been cleared.", {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart. Please try again.", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
    }
  };

  const calculateTotals = (cartItems, promotion) => {
    let subtotal = 0;
    let discountAmount = 0;

    cartItems.forEach((item) => {
      const itemTotal = item.discountedPrice * item.quantity;
      subtotal += itemTotal;

      if (promotion.length !== 0) {
        promotion.forEach((promo, index) => {
          if (promo.product.productId === item.productID) {
            discountAmount += itemTotal * promo.discount;
            amountDiscount[index] = itemTotal * promo.discount;
          }
        });
      }
    });

    const total = subtotal - discountAmount;
    setTotals({ subtotal, discountAmount, total });
  };

  const handleSelectPromotion = async (promotion) => {
    // Check if the promotion is already selected
    const isAlreadySelected = selectedCustomerPromotions.some(
      (selectedPromotion) => selectedPromotion.promotionId === promotion.promotionId
    );
  
    let updatedPromotions;
    if (isAlreadySelected) {
      // Remove the promotion if it's already selected
      updatedPromotions = selectedCustomerPromotions.filter(
        (selectedPromotion) => selectedPromotion.promotionId !== promotion.promotionId
      );
    } else {
      // Add the promotion if it's not already selected
      updatedPromotions = [...selectedCustomerPromotions, promotion];
    }
  
    // Update the cart totals after the state update
    calculateTotals(cart, updatedPromotions);
  
    // Update state synchronously
    setSelectedCustomerPromotions(updatedPromotions);
  
    // Perform the async API call to select or remove the promotion
    try {
      if (isAlreadySelected) {
        // Send the promotion removal request
        await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/cart/remove-select-promotion/${user.id}`,
          [promotion],
          { headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        // Send the promotion selection request
        await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/cart/select-promotion/${user.id}`,
          promotion,
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Error selecting promotion:", error);
    }
  };
  

  const { subtotal, discountAmount, total } = totals;
  console.log('Subtotal:', subtotal, 'Discount:', discountAmount, 'Total:', total);
  const shipping = subtotal > 50 ? 0 : 0; // Example: Free shipping over $50
  const estimate = "Ho Chi Minh city"; // Example: Estimate based on the shipping address

  return (
    <div className="cart">
      <Header />
      <div className="cart-content">
        <Title titleText="My Cart" size={24} margin_b={12} />
        {cart.length === 0 ? (
          <div className="empty-cart">
            <img src="/Images/Frame.png" alt="empty cart" className="empty-card-img" />
            <p className="empty-cart-message">Your cart is empty.</p>
          </div>
        ) : (
          <div>
            <div className="cart-items-wrapper">
              <div className="cart-items">
                <div className="cart-row">
                  <p className="cart-item-count">
                    You have <span className="item-count-number">{cart.length}</span> item(s) in your cart.
                  </p>
                  <button className="clear-cart-button button-89" onClick={handleClearCart} role="button">
                    Clear Cart
                  </button>
                </div>
                {cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-img-wrapper">
                      <img src={item.imageURL || "/Images/no-image.jpg"} alt={item.pName} className="cart__img" />
                    </div>
                    <div className="item-details">
                      <Link to={`/buy-product/${item.productID}/${item.storeID}`} className="product-link">
                        <p className="item-name">{item.pName}</p>
                      </Link>
                      <p className="item-storeid">Store: {item.storeName}</p>
                      {item.discount > 0 ? (
                        <>
                          <p className="promo-product-price">${item.price.toFixed(2)}</p>
                          <div className="flex-box">
                            <p className="promo-product-discount">
                              Price: ${item.discountedPrice.toFixed(2)}
                            </p>
                            <p className="cart_product__disscount_num">{(item.discount * 100).toFixed(0)}% off</p>
                          </div>
                        </>
                      ) : (
                        <p className="item-price">Price: ${item.price.toFixed(2)}</p>
                      )}
                    </div>
                    <p className="item-quantity">x {item.quantity}</p>
                    <button
                      className="remove-item-button x_button"
                      onClick={() =>
                        handleRemoveItem(item.productID, item.storeID, item.discountedPrice, item.quantity)
                      }
                      role="button"
                    >
                      <span>remove</span>
                      <div className="icon">
                        <i className="fa fa-remove"></i>
                      </div>
                    </button>
                  </div>
                ))}
                {/* Apply Promotion */}
                <div className="promotion-select">
                  <Typography
                    variant="h5"
                    sx={{
                      mt: 2,
                      mb: 2,
                      fontWeight: "900",
                      fontFamily: "Quicksand",
                    }}
                  >
                    Apply Promotion
                  </Typography>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    {customerPromotions.map((promotion) => {
                      const productInCart = cart.find(
                        (item) => item.productID === promotion.product.productId
                      );

                      return (
                        <PromotionTicket
                          key={promotion.promotionId}
                          promotion={promotion}
                          onSelect={handleSelectPromotion}
                          disabled={!productInCart}
                          selected={selectedCustomerPromotions.find(
                            (selectedPromotion) => selectedPromotion.promotionId === promotion.promotionId
                          ) !== undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="cart-summary">
                <CartSummary 
                  subtotal={subtotal} 
                  shipping={shipping} 
                  estimate={estimate} 
                  discountAmountList={amountDiscount}
                  total={parseFloat((total + shipping).toFixed(2))} 
                  cart={cart}
                  selectedCustomerPromotion={selectedCustomerPromotions}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;