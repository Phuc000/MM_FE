// src/Components/CartSummary/CartSummary.jsx
import {useState} from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './CartSummary.scss';
import RevalidateCartModal from '../RevalidateCartModal/RevalidateCartModal';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../hooks/useAuth';

const CartSummary = ({
  subtotal = 0,
  shipping = 0,
  estimate = '',
  total = 0,
  checkout = false,
  billPromotion = 0,
  discountAmountList=[],
  cart=[],
  selectedCustomerPromotion=[]
}) => {
  const navigate = useNavigate();
  const customerPromotionNameList = selectedCustomerPromotion.map((promotion) => promotion.name);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [revalidateData, setRevalidateData] = useState({
    productsNotAvailable: [],
    outOfStockCartItem: [],
    productUpdated: [],
  });

  const {user} = useAuth();

  const handleRevalidateCart = async (cart) => {
    var payload = {
      customerId: user.id,
      cart: cart,
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/cart/revalidate`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
  
      const validatedCart = response.data;
      setRevalidateData(validatedCart);
      return validatedCart;
    } catch (error) {
      console.error("Error revalidating cart:", error);
      toast.error("An error occurred while revalidating the cart. Please try again.", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
    }
  };
  
  const handleCheckOut = async () => {
    const validatedCart = await handleRevalidateCart(cart);
  
    // Check if any product is not available, out of stock, or updated
    if (
      validatedCart.productsNotAvailable.length > 0 ||
      validatedCart.outOfStockCartItem.length > 0 ||
      validatedCart.productUpdated.length > 0
    ) {
      setIsModalOpen(true);
    } else {
      // Proceed to checkout if no issues
      const fullcart = {
        customerId: user.id,
        cartItems: cart,
      }
      const payload = {
        cart: fullcart,
        promotions: selectedCustomerPromotion,
      };
      console.log("Payload:", payload);

      try {
        await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/cart/checkout`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        navigate("/CheckOut");
      } catch (checkoutError) {
        console.error("Error during checkout:", checkoutError);
        toast.error("An error occurred while checking out. Please try again.", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          theme: "colored",
        });
      }
    }
  };

  const handleBackToCart = () => {
    navigate('/Cart');
  };

  return (
    <>
      <div className="cart-summary_inside">
        <div className="summary-item">
          <span>Subtotal</span>
          <span>${Number(subtotal).toFixed(2)}</span>
        </div>
        <hr />
        {customerPromotionNameList.length > 0 && (
          <div>
            {customerPromotionNameList.map((name, index) => (
              console.log(discountAmountList[index]),
              <div className="summary-item" key={index}>
                <span>{name || "Special Customer Promotion"}</span>
                <span>- ${Number(discountAmountList[index]).toFixed(2)}</span>
              </div>
            ))}
            <hr />
          </div>
        )}
        <div className="summary-item">
          <span>Shipping</span>
          <span>{Number(shipping) > 0 ? `$${Number(shipping).toFixed(2)}` : 'Free'}</span>
        </div>
        <div className="summary-item">
          <span>Estimate for</span>
          <span>{estimate}</span>
        </div>
        <hr />
        {billPromotion > 0 && (
          <div>
            <div className="summary-item">
              <span>Special Bill Promotion</span>
              <span>- ${Number(billPromotion).toFixed(2)}</span>
            </div>
            <hr />
          </div>
        )}
        <div className="summary-item">
          <span>Total</span>
          <span>${Number(total).toFixed(2)}</span>
        </div>
        {!checkout && (
          <button className="checkout-btn" onClick={handleCheckOut}>
            Proceed To CheckOut <span>➔</span>
          </button>
        )}
        {checkout && (
          <button className="checkout-btn" onClick={handleBackToCart}>
            Back To Cart <span>➔</span>
          </button>
        )}
      </div>
      <RevalidateCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        revalidateData={revalidateData}
      />
    </>
    
  );
};

CartSummary.propTypes = {
  subtotal: PropTypes.number,
  shipping: PropTypes.number,
  estimate: PropTypes.string,
  total: PropTypes.number,
  checkout: PropTypes.bool,
  billPromotion: PropTypes.number,
  discountAmountList: PropTypes.array,
  cart: PropTypes.array,
  selectedCustomerPromotion: PropTypes.array
};

export default CartSummary;