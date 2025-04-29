// src/pages/Manager/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { ShowProduct, StoreCard } from "../../../Components";
import Pagination from "../../../Components/Helper/Pagination";
import ProductList from "../ProductList/ProductList";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

import "./Dashboard.scss";

const Dashboard = () => {
  // const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [storeId, setStoreId] = useState(null);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [productsPerPage] = useState(4); // Adjust the number of products per page as needed
  const [orders, setOrders] = useState([]);
  const [top10Products, setTop10Products] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/employees/${user.id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        const employeeData = response.data;
        setStoreId(employeeData.storeID);
      } catch (error) {
        console.error(`Error fetching employee ${user.id} data:`, error);
      }
    };

    if (user && user.id) {
      fetchEmployeeInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // Fetch store information
        const storeResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/stores/${storeId}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setStore(storeResponse.data);

        // Fetch order of store
        const ordersResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/store/prev/${storeId}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        console.log("Order: ", ordersResponse.data);
        setDeliveryStats(ordersResponse.data);
        // setDeliveryStats(null)

        // Fetch top 10 products
        const top10ProductsResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/products/top10stores/${storeId}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        console.log("Top 10 Products: ", top10ProductsResponse.data);
        setTop10Products(top10ProductsResponse.data);
        // setTop10Products([])

        // Fetch products
        // const productsResponse = await axios.get(
        //   `${import.meta.env.VITE_REACT_APP_API_URL}/products/store/${storeId}`,
        //   {
        //     headers: { "Content-Type": "application/json" },
        //     withCredentials: true,
        //   }
        // );
        // setProducts(productsResponse.data);
      } catch (error) {
        console.error(`Error fetching store ${storeId} data:`, error);
      }
    };

    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  // Calculate indexes for pagination
  // const indexOfLastProduct = currentPage * productsPerPage;
  // const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  // const currentProducts = products.slice(
  //   indexOfFirstProduct,
  //   indexOfLastProduct
  // );

  // Change page
  // const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPieData = (stats) => {
    const { deliveredCount, cancelledCount, ghostCount, totalBills } = stats;
    const knownTotal = deliveredCount + cancelledCount + ghostCount;
    const otherCount = totalBills - knownTotal;
  
    const pieData = [
      { name: "Delivered", value: deliveredCount },
      { name: "Cancelled", value: cancelledCount },
      { name: "Ghost", value: ghostCount },
    ];
  
    if (otherCount > 0) {
      pieData.push({ name: "Other", value: otherCount });
    }
  
    return pieData;
  };
  
  const deliveryColors = {
    Delivered: "#82ca9d",
    Cancelled: "#ff6b6b",
    Ghost: "#8884d8",
    Other: "#d0d0d0",
  };
  
  const getTotal = (deliveryStats) => {
    const pieData = getPieData(deliveryStats);
    return pieData.reduce((sum, item) => sum + item.value, 0);
  };

  // Long product names: add line breaks + smaller font
  const renderCustomXAxisTick = ({ x, y, payload }) => {
    const words = payload.value.split(' ');
    const lineHeight = 16; // Adjust line height here
  
    return (
      <g transform={`translate(${x},${y})`}>
        {words.map((word, index) => (
          <text
            key={index}
            x={0}
            y={index * lineHeight}
            dy={12}
            textAnchor="middle"
            fill="#666"
            fontSize={12}
          >
            {word}
          </text>
        ))}
      </g>
    );
  };

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <h1 style={{marginBottom:0}}>Dashboard</h1>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", width: "100%" }}>
        {/* Left: Bar Chart (60%) */}
        {top10Products.length > 0 ? (
          <div style={{ flex: 6 }}>
            <h2>Top 5 Products by Revenue</h2>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={top10Products}>
                <XAxis dataKey="name" tick={renderCustomXAxisTick} interval={0} height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: "70vh", display: "flex", flex: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
            <p style={{ color: "#888", fontSize: "1.2rem" }}>No data available for top products.</p>
          </div>
        )
      }

        {/* Right: StoreCard + Delivery Stats (40%) */}
        <div style={{ flex: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {store && (
            <div className="store__header">
              <StoreCard store={store} />
            </div>
          )}

            <div className="delivery-stats-container">
              <h2 className="delivery-title">Order Delivery Status</h2>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "1rem", gap: "1rem", width: "100%" }}>
              {deliveryStats.totalBills > 0 ? 
              getPieData(deliveryStats).map((stat) => (
                <div
                  key={stat.name}
                  className="delivery-stat-box"
                  style={{
                    backgroundColor: deliveryColors[stat.name] || "#ccc",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    minWidth: "100px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span className="delivery-stat-label" style={{ fontWeight: "bold" }}>{stat.name}</span>
                  <span className="delivery-stat-value">
                    {((stat.value / getTotal(deliveryStats)) * 100).toFixed(0)}%
                  </span>
                </div>
              )) : 
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", height: "20vh", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", borderRadius: "8px", width: "90%" }}>
                <p style={{ color: "#888", fontSize: "1.2rem" }}>No data available for order delivery.</p>
              </div>
              }
              </div>
              
            </div>
        </div>
      </div>

      
      

      
      
    </div>
  );
};

export default Dashboard;