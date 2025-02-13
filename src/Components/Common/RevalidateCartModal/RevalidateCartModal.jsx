import PropTypes from "prop-types";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
// import Modal from "react-modal"; // Install with `npm install react-modal`
import "./RevalidateCartModal.css";

const RevalidateCartModal = ({ isOpen, onClose, revalidateData }) => {
  const { productsNotAvailable, outOfStockCartItem, productUpdated } = revalidateData;
  console.log("Revalidate data:", revalidateData);
  console.log("ProductsNotAvailable:", productsNotAvailable);
  console.log("OutOfStockCartItem:", outOfStockCartItem);
  console.log("ProductUpdated:", productUpdated);

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <h2 style={{margin:0, textAlign:"center"}}>Cart Validation Results</h2>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 20
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
          <div 
            className="cart-summary-modal-content"
          >
          {/* Products Not Available */}
          {productsNotAvailable.length > 0 && (
            <div className="cart-summary-section">
              <h3>Products Not Available</h3>
              <ul>
                {productsNotAvailable.map((item) => (
                  <li key={item.productId} className="error-item">
                    <img src={item.productImage} alt={item.productName} width={64} height={64} />
                    {item.productName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Products Out of Stock */}
          {outOfStockCartItem.length > 0 && (
            <div className="cart-summary-section">
              <h3>Products Out of Stock</h3>
              <ul>
                {outOfStockCartItem.map((item) => (
                  <li key={item.productId} className="warning-item">
                    <img src={item.productImage} alt={item.productName} width={64} height={64} />
                    {item.productName} - {item.storeName} - Available Quantity: {item.availableQuantity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Products Updated */}
          {productUpdated.length > 0 && (
  <div className="cart-summary-section">
    <h3>Products Updated</h3>
    <ul>
      {productUpdated.map((item) => {
        // Determine the name to display
        const displayedName = item.nameUpdate ? `${item.nameUpdate[0]} → ${item.nameUpdate[1]}` : item.productName;

        return (
          <li key={item.productID} className="info-item">
            <div className="product-update-container">
              {/* Product Image */}
              <img src={item.productImage} alt={displayedName} width={64} height={64} className="product-image" />

              {/* Product Info */}
              <div className="product-info">
                <strong>{displayedName}</strong> <br />
                <span>Store: {item.storeName}</span>
              </div>

              {/* Updated Fields */}
              <div className="updates-list">
                {item.priceUpdate && (
                  <p>
                    <strong>Price:</strong> ${item.priceUpdate[0]} → <span className="updated-value">${item.priceUpdate[1]}</span>
                  </p>
                )}
                {item.discountUpdate && (
                  <p>
                    <strong>Discount:</strong> {item.discountUpdate[0]}% → <span className="updated-value">{item.discountUpdate[1]}%</span>
                  </p>
                )}
                {item.weightUpdate && (
                  <p>
                    <strong>Weight:</strong> {item.weightUpdate[0]}g → <span className="updated-value">{item.weightUpdate[1]}g</span>
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  </div>
)}
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
      </Dialog> 
  )
};

// Define prop types
const ProductUpdatedPropType = PropTypes.shape({
  productID: PropTypes.string.isRequired,
  storeName: PropTypes.string.isRequired,
  productName: PropTypes.string.isRequired,
  productImage: PropTypes.string,
  nameUpdate: PropTypes.arrayOf(PropTypes.string), // Tuple (string, string) → array with 2 strings
  discountUpdate: PropTypes.arrayOf(PropTypes.number), // Tuple (decimal, decimal) → array with 2 numbers
  priceUpdate: PropTypes.arrayOf(PropTypes.number), // Tuple (double, double) → array with 2 numbers
  weightUpdate: PropTypes.arrayOf(PropTypes.number), // Tuple (int, int) → array with 2 numbers
});


RevalidateCartModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    revalidateData: PropTypes.shape({
      productsNotAvailable: PropTypes.arrayOf(
        PropTypes.shape({
          productId: PropTypes.string.isRequired,
          productName: PropTypes.string.isRequired,
          productImage: PropTypes.string,
        })
      ).isRequired,
      outOfStockCartItem: PropTypes.arrayOf(
        PropTypes.shape({
          productId: PropTypes.string.isRequired,
          storeId: PropTypes.string.isRequired,
          storeName: PropTypes.string.isRequired,
          productName: PropTypes.string.isRequired,
          availableQuantity: PropTypes.number,
          productImage: PropTypes.string,
        })
      ).isRequired,
      productUpdated: PropTypes.arrayOf(ProductUpdatedPropType).isRequired,
    }).isRequired,
  };
  

export default RevalidateCartModal;
