import PropTypes from "prop-types";
import Modal from "react-modal"; // Install with `npm install react-modal`
import "./RevalidateCartModal.css";

const RevalidateCartModal = ({ isOpen, onClose, revalidateData }) => {
  const { productsNotAvailable, outOfStockCartItem, productUpdated } = revalidateData;
  console.log("Revalidate data:", revalidateData);
  console.log("ProductsNotAvailable:", productsNotAvailable);
  console.log("OutOfStockCartItem:", outOfStockCartItem);
  console.log("ProductUpdated:", productUpdated);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Revalidate Cart"
      ariaHideApp={false}
      className="modal"
      overlayClassName="overlay"
    >
      <div className="modal-content">
        <h2>Cart Validation Changes</h2>

        {/* Section 1: Products Not Available */}
        {productsNotAvailable.length > 0 && (
          <div className="section">
            <h3>Products Not Available</h3>
            <ul>
              {productsNotAvailable.map((item) => (
                <li key={item.productId}>
                  {item.productName} - {item.productDescription}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 2: Products Out of Stock */}
        {outOfStockCartItem.length > 0 && (
          <div className="section">
            <h3>Products Out of Stock</h3>
            <ul>
              {outOfStockCartItem.map((item) => (
                <li key={item.productId}>
                  {item.productName} - Available Quantity: {item.availableQuantity}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 3: Products Updated */}
        {productUpdated.length > 0 && (
          <div className="section">
            <h3>Products Updated</h3>
            <ul>
              {productUpdated.map((item) => (
                <li key={item.productId}>
                  {item.productName} - New Price: ${item.newPrice}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Close Button */}
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </Modal>
  );
};

// Define prop types
RevalidateCartModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    revalidateData: PropTypes.shape({
      productsNotAvailable: PropTypes.arrayOf(
        PropTypes.shape({
          productId: PropTypes.string.isRequired,
          productName: PropTypes.string.isRequired,
          productDescription: PropTypes.string,
          availableQuantity: PropTypes.number,
          newPrice: PropTypes.number,
        })
      ).isRequired,
      outOfStockCartItem: PropTypes.arrayOf(
        PropTypes.shape({
          productId: PropTypes.string.isRequired,
          productName: PropTypes.string.isRequired,
          availableQuantity: PropTypes.number,
        })
      ).isRequired,
      productUpdated: PropTypes.arrayOf(
        PropTypes.shape({
          productId: PropTypes.string.isRequired,
          productName: PropTypes.string.isRequired,
          newPrice: PropTypes.number,
        })
      ).isRequired,
    }).isRequired,
  };
  

export default RevalidateCartModal;
