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
  const [deliveryStats, setDeliveryStats] = useState(null);
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
        setDeliveryStats(ordersResponse.data);

        // Fetch top 10 products
        const top10ProductsResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/products/top10stores/${storeId}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setTop10Products(top10ProductsResponse.data);

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

  
  const getDeliveryStats = (orders) => {
    const counts = { Delivered: 0, Cancelled: 0, Ghost: 0 };
    orders.forEach(order => {
      if (order.deliveryStatus === "Delivered") counts.Delivered++;
      else if (order.deliveryStatus === "Cancelled") counts.Cancelled++;
      else if (order.deliveryStatus === "Ghost") counts.Ghost++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

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
  

  // Long product names: add line breaks + smaller font
  const renderCustomAxisTick = ({ x, y, payload }) => {
    const words = payload.value.split(' ');
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          fontSize={14}
          transform="rotate(-35)"
        >
          {words.map((word, index) => (
            <tspan x="0" dy={index === 0 ? 0 : 12} key={index}>
              {word}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {store && (
        <div className="store__header">
          <img
            className="cover_picture"
            src="/Images/prop_image/store.jpg"
            alt="store_image"
          />
          <StoreCard store={store} />
        </div>
      )}

      {/* <h2>Products</h2>
      <ProductList products={currentProducts} storeId={storeId} size="small" />
      <Pagination
        productsPerPage={productsPerPage}
        totalProducts={products.length}
        paginate={paginate}
        currentPage={currentPage}
      /> */}

      {/* Add Bar Chart for Top Products */}
      {top10Products.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Top 5 Products by Revenue</h2>
          <ResponsiveContainer width='100%' height={500}>
            <BarChart data={top10Products}>
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='revenue' fill='#8884d8' name='Revenue ($)' />
            </BarChart>
          </ResponsiveContainer>
          {/* <BarChart
            width={800}
            height={400}
            data={top10Products}
            margin={{ top: 5, right: 30, left: 30, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={renderCustomAxisTick}
              interval={0}
              label={{ value: 'Product', position: 'insideBottom', offset: -50 }}
            />
            <YAxis
              label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
          </BarChart> */}
        </div>
      )}

      {/* Add Pie Chart for Delivery Status Statistics */}
      {deliveryStats && (
  <div style={{ marginTop: "2rem" }}>
    <h2>Order Delivery Status</h2>
    <PieChart width={600} height={400}>
      <Pie
        data={getPieData(deliveryStats)}
        cx={250}
        cy={200}
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        outerRadius={120}
        fill="#8884d8"
        dataKey="value"
      >
        {getPieData(deliveryStats).map((entry, index) => (
          <Cell key={`cell-${index}`} fill={deliveryColors[entry.name]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </div>
)}
      
    </div>
  );
};

export default Dashboard;