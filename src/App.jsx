import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Home, Login, Cart, Category, BuyProduct, Store, Profile, AboutUs, CheckOut, Admin, Shipper, ChatPage } from "./Pages";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminDashboard from "./admin/Dashboard";
import ManageUsers from './admin/ManageUsers';
import ManageProducts from './admin/ManageProducts';
import ManagePromotions from './admin/ManagePromotions';
import ManageInventory from "./admin/ManageInventory";
import ViewOrders from "./admin/ViewOrders";
import { CartProvider } from './Context/CartContext';
import { AuthProvider } from "./Context/AuthContext";
import "./App.css";

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <div className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Category/:categoryName" element={<Category />} />
                <Route path="/Cart" element={<Cart />} />
                <Route path="/Chat" element={<ChatPage />} />
                <Route path="/CheckOut" element={<CheckOut />} />
                <Route path="/Checkout/PaymentCallBack" element={<CheckOut />} />
                <Route path="/buy-product/:productId/:storeId" element={<BuyProduct />} />
                <Route path="/store/:storeId" element={<Store />} />
                <Route path="/AboutUs" element={<AboutUs />} />
                <Route path="/Admin/*" element={<Admin />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="manage-users" element={<ManageUsers />} />
                  <Route path="manage-products" element={<ManageProducts />} />
                  <Route path="manage-promotions" element={<ManagePromotions />} />
                  <Route path="manage-inventory" element={<ManageInventory />} />
                  <Route path="view-orders" element={<ViewOrders />} />
                </Route>
                <Route path="/Shipper/*" element={<Shipper />}>

                </Route>
              </Routes>
              <ToastContainer />
            </div>
          </div>
        </Router>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;