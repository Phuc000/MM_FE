// src/pages/Manager/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { StoreCard } from "../../../Components";

import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Pie } from "recharts";

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
          },
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
          },
        );
        setStore(storeResponse.data);

        // Fetch order of store
        const ordersResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/transactions/store/prev/${storeId}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
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
          },
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
    const words = payload.value.split(" ");
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
    <div style={{ display: "flex", flexDirection: "column", padding: "0rem" }}>
      <h1 style={{ marginBottom: "0.5rem", marginTop: 0 }}>Dashboard</h1>
      <div className="dashboard-container">
        {/* Bar Chart */}
        {top10Products.length > 0 ? (
          <div className="chart-container">
            <h2 className="chart-container-h2">Top 5 Products by Revenue</h2>
            <ResponsiveContainer height={450}>
              <BarChart data={top10Products}>
                <XAxis dataKey="name" tick={renderCustomXAxisTick} interval={0} height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="no-data-container">
            <p className="no-data-text">No data available for top products.</p>
          </div>
        )}

        {/* StoreCard + Delivery Stats */}
        <div className="sidebar-container">
          {store && (
            <div className="store__header">
              <StoreCard store={store} />
            </div>
          )}

          <div className="delivery-stats-container">
            <h2 className="delivery-title">Order Delivery Status</h2>
            <div className="delivery-stats-grid">
              {deliveryStats.totalBills > 0 ? (
                getPieData(deliveryStats).map((stat) => (
                  <div
                    key={stat.name}
                    className="delivery-stat-box"
                    style={{
                      backgroundColor: deliveryColors[stat.name] || "#ccc",
                    }}
                  >
                    <span className="delivery-stat-label">{stat.name}</span>
                    <span className="delivery-stat-value">
                      {((stat.value / getTotal(deliveryStats)) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-data-delivery">
                  <p className="no-data-text">No data available for order delivery.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
