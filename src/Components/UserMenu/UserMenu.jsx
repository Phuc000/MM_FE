import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Title from '../Common/Title/Title';
import { useAuth } from "../../hooks/useAuth";
// import { useCart } from "../../Context/CartContext";
import "./UserMenu.scss";


const UserMenu = ({ username, onMenuClick, mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const { user, logout } = useAuth();
  // const { dispatch } = useCart();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    // Clear the cart after successful logout
    // dispatch({ type: 'CLEAR_CART' });
    navigate("/");
  };

  const theme = createTheme({
    typography: {
      dialogTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      dialogContent: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      dialogButton: {
        fontSize: '0.875rem',
        fontWeight: 600,
      }
    },
  });

  return (
    <div className="menu-item-wrapper">
      <Title titleText={`Hello, ${user?.fName} ${user?.lName}!`} size={24} />
      <p className="text-base font-light italic">Welcome to your account.</p>

      <div className="usr-menu-list">
        {mode === "Customer" && (
          <ul>
            <li onClick={() => onMenuClick("MyOrders")}><span >My Orders</span></li>
            <li onClick={() => onMenuClick("Promotions")}><span >Promotions</span></li>
            <li onClick={() => onMenuClick("MyAccount")}><span >My Account</span></li>
            <li onClick={() => onMenuClick("AccountDetails")}><span >Account Details</span></li>
            <li onClick={handleClickOpen}><span >Logout</span></li>
          </ul>
        )}
        {mode === "Manager" && (
          <ul>
            <li onClick={() => onMenuClick("Dashboard")}><span >Dashboard</span></li>
            <li onClick={() => onMenuClick("CreateProduct")}><span >Create New Product</span></li>
            <li onClick={() => onMenuClick("Restock")}><span >Restock</span></li>
            <li onClick={() => onMenuClick("StoreOrders")}><span >View All Orders</span></li>
            {/* <li><span onClick={() => onMenuClick("CreatePromotion")}>Create Promotion</span></li> */}
            <li onClick={handleClickOpen}><span >Logout</span></li>
          </ul>
        )}
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth={true}
      >
        <ThemeProvider theme={theme}>
          <DialogTitle 
            id="alert-dialog-title"
            sx={{ 
              fontSize: theme.typography.dialogTitle.fontSize,
              fontWeight: theme.typography.dialogTitle.fontWeight
            }}
          >
            {"Logout?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText 
              id="alert-dialog-description"
              sx={{ 
                fontSize: theme.typography.dialogContent.fontSize,
                fontWeight: theme.typography.dialogContent.fontWeight
              }}
            >
              Are you sure you want to logout?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleClose}
              sx={{ 
                fontSize: theme.typography.dialogButton.fontSize,
                fontWeight: theme.typography.dialogButton.fontWeight
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout} 
              autoFocus 
              color="error"
              sx={{ 
                fontSize: theme.typography.dialogButton.fontSize,
                fontWeight: theme.typography.dialogButton.fontWeight
              }}
            >
              Logout
            </Button>
          </DialogActions>
        </ThemeProvider>
      </Dialog>
    </div>
  );
};

export default UserMenu;