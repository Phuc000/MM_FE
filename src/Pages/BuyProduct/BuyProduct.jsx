// src/Pages/BuyProduct/BuyProduct.jsx
import React, { useEffect, useState, useRef  } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header, Footer } from "../../Components";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import "./BuyProduct.scss";
import { useAuth } from '../../hooks/useAuth'; // Import useAuth
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
  const { user } = useAuth(); // Get user from context

  const { getRankedStoresForProduct } = useLocationContext();

  const [stock, setStock] = useState(0);
  const hasJoinedGroupRef = useRef(false);  // Keeps track of whether group is joined


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
        // Fetch product details
        const productResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/product/${productId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        setProduct(productResponse.data);
        
        // Set images and discount if available
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
  
        // Fetch product availability at store
        const storeResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/${productId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
  
        let selectedStoreInfo;
        if (storeId && storeId !== 'null') {
          selectedStoreInfo = storeResponse.data.find((storeInfo) => storeInfo.storeID === storeId);
        } else {
          // Get ranked stores that have the product
          const storesWithProduct = getRankedStoresForProduct(
            storeResponse.data.map(store => store.storeID)
          );
          console.log("Stores with product:", storesWithProduct);

          // Use first (closest) store from ranked list that has stock
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
  
        // SignalR connection and group join only if not already done
        if (hubConnection.state === "Disconnected") {
          await hubConnection.start();
          console.log("SignalR connection established");
        }

        if (!hasJoinedGroupRef.current) {
          await hubConnection.invoke("JoinProductStoreGroup", productId, selectedStoreInfo.storeID);
          console.log(`Joined group for product ${productId} at store ${selectedStoreInfo.storeID}`);
          
          hasJoinedGroupRef.current = true;  // Mark group as joined
          
          hubConnection.on("ReceiveChangeStock", (updatedProductId, newStock) => {
            if (updatedProductId === productId) {
              setStock((prevStock) => prevStock - newStock);
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
            hasJoinedGroupRef.current = false;  // Mark group as left
          }
        } catch (err) {
          console.error("Error leaving SignalR group:", err);
        }
        hubConnection.off("ReceiveChangeStock");
      };
      cleanup();
    };
  }, [productId, storeId]);
  

  // useEffect(() => {
  //   // Fetch product details based on the productId
  //   axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/product/${productId}`, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //     .then((response) => {
  //       // console.log('Product Data:', response.data);
  //       setProduct(response.data);
  //       // Set images based on image
  //       if (response.data.image) {
  //         setImages(Array(4).fill(response.data.image));
  //         setSelectedImage(response.data.image);
  //       } else {
  //         setImages(defaultImages);
  //         setSelectedImage(defaultImages[0]);
  //       }
  //       // Set initial discount and discountedPrice from product data
  //       if (response.data.discount && response.data.discount > 0) {
  //         setTotalDiscount(response.data.discount);
  //       }
  //     })
  //     .catch((error) => console.error(`Error fetching product ${productId} data:`, error));

  //   // Fetch product availability at store
  //   axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/${productId}`, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //     .then((response) => {
  //       // Choose the storeId with the same storeId
  //       if (storeId && storeId !== 'null') {
  //         const selectedStoreInfo = response.data.find((storeInfo) => storeInfo.storeID === storeId);
  //         setProductAtStore(selectedStoreInfo);
  //         setStock(selectedStoreInfo.numberAtStore);
  //       } else {
  //         // Choose the storeId with the highest NumberAtStore
  //         const selectedStoreInfo = response.data.reduce((prev, current) => (prev.numberAtStore > current.numberAtStore) ? prev : current);
  //         setProductAtStore(selectedStoreInfo);
  //         setStock(selectedStoreInfo.numberAtStore);
  //         setChosenStoreId(selectedStoreInfo.storeID);
  //       }
  //     })
  //     .catch((error) => console.error(`Error fetching product availability for ${productId}:`, error));
  // }, [productId, storeId]);

  useEffect(() => {
    // Fetch store information based on chosen storeId
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

  // useEffect(() => {
  //   // Start the SignalR connection if not already connected
  //   if (hubConnection.state === "Disconnected") {
  //     hubConnection
  //       .start()
  //       .then(() => {
  //         console.log("SignalR connection established");
  //       })
  //       .catch((err) => console.error("Error starting SignalR connection:", err));
  //   }

  //   // Join the SignalR group for the specific product and store
  //   const joinGroup = async () => {
  //     try {
  //       await hubConnection.invoke("JoinProductStoreGroup", productId, chosenStoreId);
  //       console.log(`Joined group for product ${productId} at store ${chosenStoreId}`);
  //     } catch (err) {
  //       console.error("Error joining SignalR group:", err);
  //     }
  //   };
  //   joinGroup();

  //   // Handle stock updates
  //   const handleStockUpdate = (updatedProductId, newStock) => {
  //     if (updatedProductId === productId) {
  //       setStock(newStock);
  //     }
  //   };
  //   hubConnection.on("ReceiveChangeStock", handleStockUpdate);

  //   // Cleanup when leaving the page
  //   return () => {
  //     const leaveGroup = async () => {
  //       try {
  //         await hubConnection.invoke("LeaveProductStoreGroup", productId, chosenStoreId);
  //         console.log(`Left group for product ${productId} at store ${chosenStoreId}`);
  //       } catch (err) {
  //         console.error("Error leaving SignalR group:", err);
  //       }
  //     };
  //     leaveGroup();

  //     // Remove the event listener
  //     hubConnection.off("ReceiveChangeStock", handleStockUpdate);
  //   };
  // }, [productId, chosenStoreId]);

  // Function to fetch promotion information on demand
  // const fetchPromotionInfo = async () => {
  //   if (!product) {
  //     toast.error('Product information is not available.', {
  //       position: "bottom-left",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       theme: "colored",
  //     });
  //     return;
  //   }

  //   try {
  //     const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/promotions/product/${productId}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //     console.log('Promotion Data:', response.data);
  //     setPromotions(response.data);
  //     setTotalDiscount(calculateTotalDiscount(response.data));
  //     toast.success('Promotions applied successfully!', {
  //       position: "bottom-left",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       theme: "colored",
  //     });
  //   } catch (error) {
  //     console.error(`Error fetching promotion info for product ${productId}:`, error);
  //     toast.error('Failed to apply promotions. Please try again later.', {
  //       position: "bottom-left",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       theme: "colored",
  //     });
  //   }
  // };

  // const calculateTotalDiscount = (promotions) => {
  //   if (!promotions || promotions.length === 0) {
  //     return product.discount || 0; // Use product's discount if no promotions
  //   }
  //   const promotionDiscount = promotions.reduce((total, promotion) => total + promotion.Discount, 0);
  //   // Ensure the total discount does not exceed 0.99
  //   return Math.min((product.discount || 0) + promotionDiscount, 0.99);
  // };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    // const maxQuantity = productAtStore ? productAtStore.numberAtStore : 1;
    const maxQuantity = productAtStore ? stock : 1;
    setQuantity(newQuantity > 0 ? Math.min(newQuantity, maxQuantity) : 1);
  };

  const handleAddToCart = async () => {
    if (!user || user.role !== 'Customer') {
      toast.error('Log in to add items to your cart!', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
      return;
    }
  
    // Handle button class animation
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

      console.log('Purchase Info:', purchaseInfo);
  
      // Send the item to the API for adding/updating the cart
      await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/cart/add/${user.id}`, purchaseInfo);
  
      // Show a success message
      toast.success(`Added ${quantity} ${product.name} to the cart.`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });
  
      setQuantity(1); // Reset quantity input
      // await fetchCart(user.id); // Refresh the cart from the server
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
  
  return (
    <div className="buy-product">
      <Header />
      <div className="buy-product-content">
        {product && productAtStore ? (
          <>
            <div className="product-image-section">
              {/* Main Product Image */}
              <div className="main-image-container">
                <img src={selectedImage} alt={product.name} className="product-image" />
              </div>

              {/* Thumbnail Images */}
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
                  {/* Use Link to navigate to the Store page with storeId */}
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
                    <>
                      <p className="product-card-price">${product.price.toFixed(2)}</p>
                    </>
                  )}
                  <p className="product-description">Weight: {product.weight}g</p>
                  <div className='product-at-store'>
                    <p>Stock: </p>
                    {/* <p className='aeon_pink'> {productAtStore.numberAtStore} Items In Stock</p> */}
                    <p className='aeon_pink'> {stock} Items In Stock</p>
                  </div>
                </div>
              </div>
              {/* Quantity Input */}
              <div className='quantity-section'>
                <div className="quantity-input">
                  <label htmlFor="quantity"></label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                  />
                </div>
                {/* Add to Cart Button */}
                <button
                  id='add-to-cart-button'
                  className={`add-to-cart ${buttonClass}`}
                  onClick={handleAddToCart}
                >
                </button>
              </div>
              {/* Optional: Button to Fetch Promotions
              {product.discount === 0 && (
                <div className="fetch-promotion">
                  <button onClick={fetchPromotionInfo} className="apply-promotion-button">
                    Apply Promotions
                  </button>
                </div>
              )} */}
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