import axios from 'axios';
import { toast } from 'react-toastify';

export const addToCart = async (userId, productId, quantity, locationContext) => {
  try {
    // Fetch product details
    const productResponse = await axios.get(
      `${import.meta.env.VITE_REACT_APP_API_URL}/products/product/${productId}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const product = productResponse.data;

    // Fetch product store availability
    const storeResponse = await axios.get(
      `${import.meta.env.VITE_REACT_APP_API_URL}/products/atstore/${productId}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // Get ranked stores that have the product
    const storesWithProduct = locationContext.getRankedStoresForProduct(
      storeResponse.data.map(store => store.storeID)
    );

    if (!storesWithProduct.length) {
      throw new Error('No stores available with this product');
    }

    // Use first (closest) store from ranked list that has stock
    const closestStore = storesWithProduct[0];
    const selectedStoreInfo = storeResponse.data.find(
      (storeInfo) => storeInfo.storeID === closestStore.storeID
    );

    if (!selectedStoreInfo || selectedStoreInfo.numberAtStore <= 0) {
      throw new Error('Product not available at nearest store');
    }

    // Fetch store details
    const storeDetailsResponse = await axios.get(
      `${import.meta.env.VITE_REACT_APP_API_URL}/stores/${selectedStoreInfo.storeID}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const store = storeDetailsResponse.data;

    const purchaseInfo = {
      cartItemId: product.productID,
      productID: product.productID,
      name: product.name,
      quantity, 
      price: product.price,
      storeID: selectedStoreInfo.storeID,
      hasStock: true,
      storeName: store.name,
      discount: product.discount || 0,
      unit: product.unit || '',
      discountedPrice: product.discountedPrice || product.price,
      weight: product.weight || 0,
      image: product.image || '/Images/no-image.jpg',
    };

    // Add to cart
    await axios.post(
      `${import.meta.env.VITE_REACT_APP_API_URL}/cart/add/${userId}`,
      purchaseInfo
    );

    toast.success(`Added ${quantity} ${product.name} to the cart.`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        theme: "colored",
      });

    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    toast.error(error.message || 'Failed to add item to the cart.', {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      theme: "colored",
    });
    return false;
  }
};