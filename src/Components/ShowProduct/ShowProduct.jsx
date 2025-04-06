import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationContext } from '../../Context/LocationContext';
import axios from 'axios';
import "./ShowProduct.scss";

const ShowProduct = ({ product, storeId }) => {
  const [promotions, setPromotions] = useState([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const navigate = useNavigate();
  const { getRankedStoresForProduct } = useLocationContext();

  // console.log("Product:", product);

  // Set promotion immediately if provided
  useEffect(() => {
    if (product.discount) {
      setPromotions([product.discount]);
      setTotalDiscount(product.discountedPrice ?? 0);
    }
  }, [product]);

  const handleClick = async (e) => {
    e.preventDefault(); // prevent default <Link> behavior

    let finalStoreId = storeId;

    if (!storeId) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/${product.productID}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        const storeInfoArray = response.data;

        const rankedStores = getRankedStoresForProduct(
          storeInfoArray.map(store => store.storeID)
        );

        if (rankedStores.length > 0) {
          const stockByStore = new Map(
            storeInfoArray.map(store => [store.storeID, store.numberAtStore])
          );
          finalStoreId = rankedStores.find(
            store => (stockByStore.get(store.storeID) || 0) > 0
          )?.storeID || rankedStores[0].storeID;
        } else {
          const maxStockStore = storeInfoArray.reduce((prev, current) =>
            (prev.numberAtStore > current.numberAtStore) ? prev : current
          );
          finalStoreId = maxStockStore.storeID;
        }
      } catch (error) {
        console.error(`Error fetching store info for product ${product.productID}:`, error);
        return;
      }
    }

    // Now navigate to the proper URL
    navigate(`/buy-product/${product.productID}/${finalStoreId}`);
  };

  return (
    <div className="item-product">
      <a href={`/buy-product/${product.productID}/${storeId || ''}`} onClick={handleClick} className="product-link">
        <article className="product-card" key={product.name}>
          <div className="product-card__body">
            <div className="product-img-wrapper">
              {product.image ? (
                <img src={product.image} alt={product.name} className="product-card__img" />
              ) : (
                <img src="/Images/no-image.jpg" alt={product.name} className="product-card__img" />
              )}
            </div>
            <p className="product-card__name">{product.name}</p>
            {promotions && promotions.length > 0 ? (
              <>
                <p className="promo-product-price">${product.price.toFixed(2)}</p>
                <p className="product__disscount">-{(product.discount * 100).toFixed(0)}%</p>
                <p className="promo-product-discount">${totalDiscount.toFixed(2)}</p>
              </>
            ) : (
              <p className="product-card__price">${product.price.toFixed(2)}</p>
            )}
            <div className="product-card__buttons">
              <button className="btn btn--secondary">Buy</button>
              <button className="btn btn--secondary--transparent">Details</button>
            </div>
          </div>
        </article>
      </a>
    </div>
  );
};

export default ShowProduct;
