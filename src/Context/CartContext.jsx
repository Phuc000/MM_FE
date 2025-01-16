// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import axios from 'axios';

// const CartContext = createContext();

// const cartReducer = (state, action) => {
//   switch (action.type) {
//     case 'SET_CART':
//       return {
//         ...state,
//         cart: action.payload,
//       };
//     case 'CLEAR_CART':
//       return {
//         ...state,
//         cart: [],
//         selectedCustomerPromotion: null,
//       };
//     case 'SET_CUSTOMER_PROMOTION':
//       return {
//         ...state,
//         selectedCustomerPromotion: action.payload,
//       };
//     case 'CLEAR_CUSTOMER_PROMOTION':
//       return {
//         ...state,
//         selectedCustomerPromotion: null,
//       };
//     default:
//       return state;
//   }
// };

// export const CartProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(cartReducer, {
//     cart: [],
//     selectedCustomerPromotion: null,
//   });

//   const fetchCart = async (customerId) => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/cart/${customerId}`);
//       dispatch({ type: 'SET_CART', payload: response.data });
//     } catch (error) {
//       console.error('Error fetching cart:', error);
//     }
//   };

//   return (
//     <CartContext.Provider value={{ state, dispatch, fetchCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// };

import { createContext, useContext } from 'react';
import { useState } from 'react';
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedCustomerPromotion, setSelectedCustomerPromotion] = useState([]);

  return (
    <CartContext.Provider value={{ cart, selectedCustomerPromotion, setCart, setSelectedCustomerPromotion }}>
      {children}
    </CartContext.Provider>
  );
};
