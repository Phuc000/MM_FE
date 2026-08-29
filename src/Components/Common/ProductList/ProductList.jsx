import React from "react";
import ShowProduct from "../../ShowProduct/ShowProduct";
import "./ProductList.scss";

const ProductList = ({ products, storeId = null, size = "default" }) => {
  return (
    <div className={`grid-products-container ${size === "small" ? "small" : ""}`}>
      {products.map((product) => (
        <ShowProduct key={product.productID} product={product} storeId={storeId} />
      ))}
    </div>
  );
};

export default ProductList;
