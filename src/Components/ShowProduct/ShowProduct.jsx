// ShowProduct.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocationContext } from '../../Context/LocationContext';

import axios from 'axios';
import "./ShowProduct.scss";

const ShowProduct = ({ product, storeId }) => {
  const [promotions, setPromotions] = useState([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [pageStoreId, setPageStoreId] = useState(storeId);
  const { getRankedStoresForProduct } = useLocationContext();

  // Fetch store information based on productId if storeId is not provided
  useEffect(() => {
    const fetchStoreInfo = async () => {
      if (!pageStoreId) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/${product.productID}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const storeInfoArray = response.data;

          // Get ranked stores that have the product
          const rankedStores = getRankedStoresForProduct(
            storeInfoArray.map(store => store.storeID)
          );
          
          let selectedStoreId;
          if (rankedStores.length > 0) {
            // Get stock levels for ranked stores
            const stockByStore = new Map(
              storeInfoArray.map(store => [store.storeID, store.numberAtStore])
            );

            // Find first store with stock > 0, otherwise use highest ranked
            selectedStoreId = rankedStores.find(
              store => (stockByStore.get(store.storeID) || 0) > 0
            )?.storeID || rankedStores[0].storeID;
          } else {
            // Fallback: Choose store with highest stock
            const maxStockStore = storeInfoArray.reduce((prev, current) => 
              (prev.numberAtStore > current.numberAtStore) ? prev : current
            );
            selectedStoreId = maxStockStore.storeID;
          }

          setPageStoreId(selectedStoreId);
        } catch (error) {
          console.error(`Error fetching store info for product ${product.productID}:`, error);
        }
      }
    };
  
    fetchStoreInfo();
  }, [pageStoreId, product.productID]);
  
  useEffect(() => {
    const fetchPromotionInfo = async () => {
      try {
        if (product.discount) {
          setPromotions([product.discount]);
          setTotalDiscount(calculateTotalDiscount([product]));
          return;
        }
        // const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/promotionfromproduct/${product.productID}`, {
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        // });
        // const promotionInfo = response.data;
        // setPromotions(promotionInfo);
        // setTotalDiscount(calculateTotalDiscount(promotionInfo));
      } catch (error) {
        console.error(`Error fetching promotion info for product ${product.productID}:`, error);
      }
    };

    fetchPromotionInfo();
  }, [product.productID]);

  const calculateTotalDiscount = (promotions) => {
    if (!promotions || promotions.length === 0) {
      return 0; // No discounts
    }
    const totalDiscount = promotions.reduce((total, promotion) => total + promotion.discount, 0);
    // Ensure the total discount does not exceed 0.99
    return Math.min(totalDiscount, 0.99);
  };

  return (
    <div className="item-product">
      <Link 
        to={`/buy-product/${product.productID}/${pageStoreId}`} 
        key={product.productID}
        className="product-link"
      >
      <article className="product-card" key={product.pName}>
      {/* <div className='product-img-wrapper'>
        {product.Image ? (
          <img src={`${product.Image}`} alt={product.pName} className="product-card__img" />
        ) : (
          <img src="/Images/no-image.jpg" alt={product.pName} className="product-card__img" />
        )}
      </div> */}
      <div className="product-card__body">
        <div className="product-img-wrapper">
          {product.imageURL ? (
            <img src={product.imageURL} alt={product.pName} className="product-card__img" />
          ) : (
            <img src="/Images/no-image.jpg" alt={product.pName} className="product-card__img" />
          )}
        </div>
        <p className="product-card__name">{product.pName}</p>
        {promotions && promotions.length > 0 ? (
            <>
                <p className="promo-product-price">${product.price.toFixed(2)}</p>
                <p className="product__disscount">-{totalDiscount.toFixed(2) * 100}%</p>
                <p className="promo-product-discount">${(product.price * (1 - totalDiscount)).toFixed(2)}</p>
            </>
        ) : (
            <>
            <p className="product-card__price">${product.price.toFixed(2)}</p>
            </>
        )}
        <div className="product-card__buttons">
          <button className="btn btn--secondary">Buy</button>
          <button className="btn btn--secondary--transparent">Details</button>
        </div>
        </div>
        </article>
      </Link>
    </div>
  );
};

export default ShowProduct;
