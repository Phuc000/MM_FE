// CreateProduct.jsx
import React, { useState } from "react";
import "./CreateProduct.scss";

const CreateProduct = () => {
  const [productData, setProductData] = useState({
    productID: "",
    category: "",
    description: "",
    name: "",
    price: "",
    weight: "",
  });
  const [images, setImages] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add product function (to be implemented)
    console.log(productData, images);
  };

  return (
    <div className="create-product">
      <h1>Create Product</h1>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="left-section">
          <label>Product ID</label>
          <input
            type="text"
            name="ProductID"
            value={productData.productID}
            onChange={handleInputChange}
            required
          />

          <label>Category</label>
          <input
            type="text"
            name="Category"
            value={productData.category}
            onChange={handleInputChange}
            required
          />

          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleInputChange}
            required
          />

          <label>Price</label>
          <input
            type="number"
            name="Price"
            value={productData.price}
            onChange={handleInputChange}
            required
          />

          <label>Weight</label>
          <input
            type="number"
            name="Weight"
            value={productData.weight}
            onChange={handleInputChange}
            required
          />

          <label>Description</label>
          <textarea
            name="Description"
            value={productData.Description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="right-section">
          <label>Upload Product Images (up to 4)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          <div className="image-preview">
            {images.map((src, index) => (
              <img key={index} src={src} alt={`Preview ${index + 1}`} />
            ))}
          </div>

          <button type="submit" className="submit-button">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
