import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {Header, Footer, ShowProduct } from "../../Components";
import FeatureAd from '../../Components/Common/Feature_Ad/FeatureAd';
import ProductList from '../../Components/Common/ProductList/ProductList';
import PaginationFilter from '../../Components/Common/PaginationFilter/PaginationFilter';
import axios from "axios";

import "./Store.css";

const Store = () => {
  const [products, setProducts] = useState([]);
    const { storeId } = useParams();
    const [ store, setStore ] = useState();
    const [filteredCount, setFilteredCount] = useState(0);

    useEffect(() => {
      // Fetch category-specific data from JSON file based on categoryName
      axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/store/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          // console.log('Fetched Data:', response.data);
          return response.data;
        })
        .then((data) => {
          // console.log('Fetched Data:', data);
          setProducts(data);
        })
        .catch((error) => console.error(`Error fetching store ${storeId} data:`, error));

      axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          // console.log('Fetched Data:', data);
          setStore(data);
        })
        .catch((error) => console.error(`Error fetching store ${storeId} data:`, error));
    }, [storeId]);

    return (
      <div className="store">
        <Header/>
        <div className="store-content">
          <header className="products__header container">
            {store?.name && 
              <h2 className="subtitle subtitle--products">
                <div className="store-logo">
                  <img src="/Images/prop_image/store-icon.svg" alt={`${store.name} logo`} />
                </div>
                {store.name}
              </h2>}
          </header>
  
          <div className="container">
            <PaginationFilter 
              items={products}
              showOnSaleFilter={true}
            >
              {(currentItems, filteredCount, paginationControls) => (
                <>
                  <p className="cart-item-count reduce-mb">We found 
                    <span className="item-count-number"> {filteredCount} </span>
                    items for you!
                  </p>
                  {paginationControls}
                  <ProductList products={currentItems} storeId={storeId} size='small' />
                </>
              )}
            </PaginationFilter>
          </div>
        </div>
        <FeatureAd />
        <Footer/>
      </div>
    );
  };

export default Store;