// src/Shipper.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "../../Components/UserLayout/UserLayout";
import ShipperDashboard from "../../shipper/Dashboard";
import DeliveryHistory from "../../shipper/DeliveryHistory";
import PendingDeliveries from "../../shipper/PendingDeliveries";
import {
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
  ListAlt as ListAltIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth"; // Adjust the import path as necessary

const Shipper = () => {
  const [open, setOpen] = React.useState(() => window.innerWidth >= 480);
  const { user } = useAuth(); // Destructure user from useAuth

  // Ensure the user is authenticated and has the "Shipper" role
  if (!user || user.role !== "Shipper") {
    return <Navigate to="/login" replace />;
  }

  // Menu items for the shipper sidebar
  const shipperMenuItems = [
    { text: "Dashboard", icon: <LocalShippingIcon />, path: "/shipper" },
    { text: "Pending Deliveries", icon: <ListAltIcon />, path: "/shipper/pending-deliveries" },
    { text: "Delivery History", icon: <AssignmentIcon />, path: "/shipper/delivery-history" },
  ];

  // Extract user details
  const shipperName = `${user.fName} ${user.lName}`;
  const shipperEmail = user.email;
  const shipperInitial = user.fName.charAt(0).toUpperCase();

  return (
    <UserLayout
      menuItems={shipperMenuItems}
      userName={shipperName}
      userEmail={shipperEmail}
      userInitial={shipperInitial}
      open={open}
      setOpen={setOpen}
    >
      <Routes>
        <Route path="/" element={<ShipperDashboard />} />
        <Route path="/pending-deliveries" element={<PendingDeliveries />} />
        <Route path="/delivery-history" element={<DeliveryHistory />} />
      </Routes>
    </UserLayout>
  );
};

export default Shipper;
