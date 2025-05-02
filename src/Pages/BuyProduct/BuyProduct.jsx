// src/Pages/BuyProduct/BuyProduct.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header, Footer } from "../../Components";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import "./BuyProduct.scss";
import { useAuth } from '../../hooks/useAuth';
import { useLocationContext } from '../../Context/LocationContext';
import hubConnection from '../../services/SignalR/signalrService';

const BuyProduct = () => {
  const { productId, storeId } = useParams();
  const [chosenStoreId, setChosenStoreId] = useState(storeId);
  const [product, setProduct] = useState(null);
  const [productAtStore, setProductAtStore] = useState(null);
  const [quantity, setQuantity] = useState(1); // Default quantity is 1
  const [promotions, setPromotions] = useState([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [store, setStore] = useState();
  const [buttonClass, setButtonClass] = useState('');
  const { user } = useAuth();
  const { getRankedStoresForProduct } = useLocationContext();
  const [stock, setStock] = useState(0);
  const hasJoinedGroupRef = useRef(false);

  const defaultImages = [
    '/Images/no-image.jpg',
    '/Images/no-image.jpg',
    '/Images/no-image.jpg',
    '/Images/no-image.jpg'
  ];

  const [images, setImages] = useState(defaultImages);
  const [selectedImage, setSelectedImage] = useState(images[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/product/${productId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        setProduct(productResponse.data);
        
        if (productResponse.data.image) {
          setImages(Array(4).fill(productResponse.data.image));
          setSelectedImage(productResponse.data.image);
        } else {
          setImages(defaultImages);
          setSelectedImage(defaultImages[0]);
        }
  
        if (productResponse.data.discount && productResponse.data.discount > 0) {
          setTotalDiscount(productResponse.data.discount);
        }
  
        const storeResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/${productId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
  
        let selectedStoreInfo;
        if (storeId && storeId !== 'null') {
          selectedStoreInfo = storeResponse.data.find((storeInfo) => storeInfo.storeID === storeId);
        } else {
          const storesWithProduct = getRankedStoresForProduct(
            storeResponse.data.map(store => store.storeID)
          );
          console.log("Stores with product:", storesWithProduct);
          const closestStore = storesWithProduct[0];
          selectedStoreInfo = storeResponse.data.find(
            (storeInfo) => storeInfo.storeID === closestStore.storeID
          );
          setChosenStoreId(selectedStoreInfo.storeID);
        }
  
        if (!selectedStoreInfo) {
          console.error("Selected store info not found for the given product");
          return;
        }
  
        setProductAtStore(selectedStoreInfo);
        setStock(selectedStoreInfo.numberAtStore);
  
        if (hubConnection.state === "Disconnected") {
          await hubConnection.start();
          console.log("SignalR connection established");
        }

        if (!hasJoinedGroupRef.current) {
          await hubConnection.invoke("JoinProductStoreGroup", productId, selectedStoreInfo.storeID);
          console.log(`Joined group for product ${productId} at store ${selectedStoreInfo.storeID}`);
          hasJoinedGroupRef.current = true;
          
          hubConnection.on("ReceiveChangeStock", (updatedProductId, newStock) => {
            if (updatedProductId === productId) {
              setStock(newStock); // Assume newStock is absolute stock value
            }
          });
        }
      } catch (error) {
        console.error("Error fetching data or joining SignalR group:", error);
      }
    };
  
    fetchData();

    return () => {
      const cleanup = async () => {
        try {
          if (hasJoinedGroupRef.current) {
            await hubConnection.invoke("LeaveProductStoreGroup", productId, chosenStoreId);
            console.log(`Left group for product ${productId} at store ${chosenStoreId}`);
            hasJoinedGroupRef.current = false;
          }
        } catch (err) {
          console.error("Error leaving SignalR group:", err);
        }
        hubConnection.off("ReceiveChangeStock");
      };
      cleanup();
    };
  }, [productId, storeId]);

  useEffect(() => {
    if (!chosenStoreId || chosenStoreId === 'null') return;
    else {
      axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/stores/${chosenStoreId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          setStore(response.data);
        })
        .catch((error) => console.error(`Error fetching store ${chosenStoreId} data:`, error));
    }
  }, [chosenStoreId]);

  const handleQuantityChange = (e) => {
    const inputValue = e.target.value;
  
    // Allow empty input while typing
    if (inputValue === '') {
      setQuantity('');
      return;
    }
  
    // Parse the input value to a number
    const newQuantity = parseInt(inputValue, 10);
  
    // If the input is not a valid number, keep it as is (allow typing)
    if (isNaN(newQuantity)) {
      setQuantity(inputValue);
      return;
    }
  
    // Enforce constraints based on user role
    if (user?.role === 'StoreManager') {
      // For StoreManager: Only enforce x > 0
      setQuantity(newQuantity > 0 ? newQuantity : 1);
    } else {
      // For others: Enforce 0 < x <= stock
      const maxQuantity = productAtStore ? stock : 1;
      setQuantity(newQuantity > 0 ? Math.min(newQuantity, maxQuantity) : 1);
    }
  };
  
  // Handle blur to enforce min=1 if the input is empty or invalid
  const handleBlur = () => {
    if (quantity === '' || isNaN(parseInt(quantity, 10))) {
      setQuantity(1); // Revert to 1 if the input is empty or invalid
    } else {
      const newQuantity = parseInt(quantity, 10);
      if (user?.role === 'StoreManager') {
        setQuantity(newQuantity > 0 ? newQuantity : 1);
      } else {
        const maxQuantity = productAtStore ? stock : 1;
        setQuantity(newQuantity > 0 ? Math.min(newQuantity, maxQuantity) : 1);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!user || user.role !== 'Customer') {
      toast.error('Log in as a customer to add items to your cart!', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
      return;
    }
  
    setButtonClass('onclic');
    setTimeout(() => {
      setButtonClass('validate');
      setTimeout(() => {
        setButtonClass('');
      }, 1250);
    }, 2250);
  
    try {
      const purchaseInfo = {
        productID: product.productID,
        pName: product.name,
        quantity,
        price: product.price,
        storeID: productAtStore.storeID,
        storeName: store.name,
        discount: product.discount || 0,
        discountedPrice: product.discountedPrice || product.price,
        imageUrl: product.image || '/Images/no-image.jpg',
      };

      await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/cart/add/${user.id}`, purchaseInfo);
  
      toast.success(`Added ${quantity} ${product.name} to the cart.`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
  
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to the cart.', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
    }
  };

  // New Restock Handler based on Restock.jsx
  const handleRestock = async () => {
    if (!user || user.role !== 'StoreManager') {
      toast.error('Only store managers can restock products!', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
      return;
    }

    if (!quantity) {
      toast.error('Please enter a valid restock quantity!', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
      return;
    }

    setButtonClass('onclic');
    setTimeout(() => {
      setButtonClass('validate');
      setTimeout(() => {
        setButtonClass('');
      }, 1250);
    }, 2250);

    try {
      // Send PUT request to restock (same endpoint as Restock.jsx)
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/products/addtostore/${productId}/${chosenStoreId}/${Math.abs(quantity)}`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Update local stock
      setStock(prevStock => prevStock + quantity);

      toast.success(`Successfully restocked ${quantity} ${product?.name}`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });

      setQuantity(1); // Reset quantity
    } catch (error) {
      console.error("Error restocking product:", error);
      toast.error('Error restocking product', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
    }
  };

  return (
    <div className="buy-product">
      <Header />
      <div className="buy-product-content">
        {product && productAtStore ? (
          <>
            <div className="product-image-section">
              <div className="main-image-container">
                <img src={selectedImage} alt={product.name} className="product-image" />
              </div>
              <div className="product-thumbnails">
                {images.map((img, index) => (
                  <div key={index} className="thumbnail-container">
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="thumbnail-image"
                      onError={(e) => { e.target.src = '/Images/no-image.jpg'; }}
                      onClick={() => setSelectedImage(img)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className='product-info-section'>
              <Link to={`/Category/${product.category}`}>
                <p className='product-category'>{product.category}</p>
              </Link>
              <h2 className="product-name">{product.name}</h2>
              <div className='info'>
                <div className="product-info">
                  <Link className='product-category' to={`/Store/${productAtStore.storeID}`}>
                    {store?.name && <p>{store.name}</p>}
                  </Link>
                  <p className="product-description">{product.description}</p>
                  {product.discount && product.discount > 0 ? (
                    <>
                      <p className="promo-product-price_2">${product.price.toFixed(2)}</p>
                      <p className="product__disscount_num">{(totalDiscount * 100).toFixed(0)}% off</p>
                      <p className="promo-product-discount_2">${(product.discountedPrice).toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="product-card-price">${product.price.toFixed(2)}</p>
                  )}
                  <p className="product-description">Net: {product.amount} {
                    !product.unit ? "unit" :
                    product.unit.toLowerCase() === "milliliter" || product.unit.toLowerCase() === "mililiter" ? "ml" :
                    product.unit
                  }</p>
                  <div className='product-at-store'>
                    <p>Stock: </p>
                    <p className='aeon_pink'> {stock} Items In Stock</p>
                  </div>
                </div>
              </div>
              <div className='quantity-section'>
                <div className="quantity-input">
                  <label htmlFor="quantity" style={{marginRight: '10px'}}>
                    {user?.role === 'StoreManager' ? 'Restock Quantity' : 'Purchase Quantity'}
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onBlur={handleBlur}
                    min="1" // Optional: Keep for browser validation, but logic handles it
                    max={user?.role === 'StoreManager' ? undefined : (productAtStore ? stock : 1)} // Optional: Set max for non-StoreManagers
                  />
                </div>
                {user?.role === 'StoreManager' ? (
                  <button
                    id='restock-button'
                    className={`restock ${buttonClass}`} // Assumes restock class in SCSS
                    onClick={handleRestock}
                  >
                    
                  </button>
                ) : (
                  <button
                    id='add-to-cart-button'
                    className={`add-to-cart ${buttonClass}`}
                    onClick={handleAddToCart}
                  >
                    
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BuyProduct;