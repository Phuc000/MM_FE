// src/Pages/Profile/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Footer, UserMenu } from "../../Components";
import "./Profile.scss";
import MyAccount from "../../Components/Common/UserComponents/MyAccount";
import MyOrders from "../../Components/Common/UserComponents/MyOrders";
import Promotions from "../../Components/Common/UserComponents/Promotions";
import Restock from "../../Components/Common/ManagerComponents/Restock";
import CreateProduct from "../../Components/Common/ManagerComponents/CreateProduct";
import CreatePromotion from "../../Components/Common/ManagerComponents/CreatePromotion";
import Dashboard from "../../Components/Common/ManagerComponents/Dashboard";
import StoreOrders from "../../Components/Common/ManagerComponents/StoreOrders";
import AccountDetails from "../../Components/Common/UserComponents/AccountDetail";
import axios from "axios";
import { Modal, IconButton, Box, Typography, Button, Badge, Snackbar, Alert } from '@mui/material';
import { keyframes } from '@mui/system';
import CasinoIcon from '@mui/icons-material/Casino';
import { Wheel } from 'react-custom-roulette';
import { useAuth } from "../../hooks/useAuth";

// Define the pulse animation
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(254, 59, 212, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(254, 59, 212, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(254, 59, 212, 0);
  }
`;

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeComponent, setActiveComponent] = useState("MyAccount");
  const [showManager, setShowManager] = useState(false);
  const [showUser, setShowUser] = useState(false);

  // Wheel state
  const [wheelData, setWheelData] = useState([]);
  const [openWheel, setOpenWheel] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [fortuneChances, setFortuneChances] = useState(0);

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (!user) {
      navigate("/Login");
      return;
    }

    if (user.role === "Customer") {
      setShowUser(true);
      fetchCustomerData(user.id);
      fetchWheelData();
    } else if (user.role === "StoreManager") {
      setShowManager(true);
      setActiveComponent("Dashboard");
    } else if (user.role === "Admin") {
      navigate("/Admin");
    } else if (user.role === "Shipper") {
      navigate("/Shipper");
    }
  }, [user, navigate]);

  const fetchCustomerData = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/customers/${userId}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const SpinChances = response.data.fortuneChance ? response.data.fortuneChance : 0;
      setFortuneChances(SpinChances);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const fetchWheelData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      // Map promotions to wheel data
      const promotions = response.data.map((promo) => ({
        promotionId: promo.promotionId,
        option: `${promo.product.pName} - ${(promo.discount * 100).toFixed(0)}% OFF`,
        discount: promo.discount,
        name: promo.name,
        description: promo.description,
        product: promo.product,
      }));

      // Add the "Better Luck Next Time" option
      promotions.push({
        promotionId: null,
        option: "Better Luck Next Time",
        discount: 0,
        name: "Better Luck Next Time",
        description: "",
        product: null,
      });

      setWheelData(promotions);
    } catch (error) {
      console.error("Error fetching wheel data:", error);
    }
  };

  // Function to handle opening the modal
  const handleOpenWheel = () => {
    setOpenWheel(true);
  };

  // Function to handle closing the modal
  const handleCloseWheel = () => {
    setOpenWheel(false);
  };

  // Function to handle spinning the wheel
  const handleSpinClick = () => {
    if (fortuneChances > 0 && wheelData.length > 0) {
      const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  // Function to handle the result when the wheel stops spinning
  const handleWheelStop = async () => {
    const winner = wheelData[prizeNumber];
    setMustSpin(false);
    setFortuneChances(fortuneChances - 1);

    if (winner.promotionId) {
      // User won a promotion
      setSnackbarMessage(`🎉 Congratulations! You won ${winner.option}!`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      // Post the customer promotion to the API
      try {
        await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/promotions/customer/${winner.promotionId}/${user.id}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        console.log("Promotion applied successfully");
      } catch (error) {
        console.error("Error applying promotion:", error);
        setSnackbarMessage("❌ Failed to apply promotion. Please try again.");
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } else {
      // User landed on "Better Luck Next Time"
      setSnackbarMessage("😞 Better luck next time!");
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
    }

  };

  // Adjust the badge position
  const badgeStyle = {
    '& .MuiBadge-badge': {
      left: 8,
      top: 8,
    },
  };

  // Function to handle which menu item is clicked
  const handleMenuClick = (componentName) => {
    setActiveComponent(componentName);
  };

  return (
    <div className="profile">
      <Header />
      <div className="profile-content">
        {showUser && (
          <div className="profile-content-wrapper">
            <UserMenu username={`${user.fName} ${user.lName}`} onMenuClick={handleMenuClick} mode="Customer" />
            <div className="component-container">
              {activeComponent === "MyOrders" && <MyOrders />}
              {activeComponent === "Promotions" && <Promotions />}
              {activeComponent === "MyAccount" && <MyAccount />}
              {activeComponent === "AccountDetails" && <AccountDetails />}
            </div>
          </div>
        )}
        {showManager && (
          <div className="profile-content-wrapper">
            <UserMenu username={`${user.fName} ${user.lName}`} onMenuClick={handleMenuClick} mode="Manager" />
            <div className="component-container">
              {activeComponent === "Dashboard" && <Dashboard />}
              {activeComponent === "Restock" && <Restock />}
              {activeComponent === "CreateProduct" && <CreateProduct />}
              {/* {activeComponent === "CreatePromotion" && <CreatePromotion />} */}
              {activeComponent === "StoreOrders" && <StoreOrders />}
            </div>
          </div>
        )}
        {!showUser && !showManager && (
          <div>
            <h2>Please log in to view your profile</h2>
          </div>
        )}

        {/* Floating Icon */}
        {showUser && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
            }}
          >
            <Badge
              badgeContent={fortuneChances > 0 ? fortuneChances : null}
              color="secondary"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={badgeStyle}
            >
              <IconButton
                onClick={handleOpenWheel}
                sx={{
                  backgroundColor: '#fe3bd4',
                  color: 'white',
                  width: 64,
                  height: 64,
                  animation: `${pulse} 4s infinite`,
                  '&:hover': {
                    backgroundColor: '#d81b60',
                  },
                }}
              >
                <CasinoIcon sx={{ fontSize: 40 }} />
              </IconButton>
            </Badge>
          </Box>
        )}

        {/* Modal for the Fortune Wheel */}
        <Modal open={openWheel} onClose={handleCloseWheel}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              p: 4,
              width: '90%',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{
                fontWeight: "bold",
                fontFamily: "'Quicksand', sans-serif",
                fontSize: "1.8rem",
              }}
            >
              Spin the Wheel!
            </Typography>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                backgroundColors={["#3e3e3e", "#df3428"]}
                textColors={["#ffffff"]}
                outerBorderColor={"#000000"}
                outerBorderWidth={5}
                innerRadius={20}
                radiusLineColor={"#ffffff"}
                radiusLineWidth={8}
                spinDuration={0.5}
                onStopSpinning={handleWheelStop}
              />
              {fortuneChances === 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    width: "80%",
                    color: "white",
                    padding: 2,
                    borderRadius: 1,
                    zIndex: 99,
                  }}
                >
                  <Typography>
                    Purchase more than $100 to gain a spin.
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography
              sx={{
                mt: 2,
                fontWeight: "bold",
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              Attempt(s): {fortuneChances}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSpinClick}
              sx={{
                mt: 2,
                backgroundColor: "#fe3bd4",
                color: "#ffffff",
                fontWeight: "bold",
                fontFamily: "'Quicksand', sans-serif",
                "&:hover": {
                  backgroundColor: "#d81b60",
                },
              }}
              disabled={fortuneChances === 0 || wheelData.length === 0 || mustSpin}
            >
              Spin
            </Button>
          </Box>
        </Modal>

        {/* Snackbar for displaying the result */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;