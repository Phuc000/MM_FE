// src/Manager.jsx
import React, { lazy } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from '../../Components/UserLayout/UserLayout';
import { useAuth } from '../../hooks/useAuth';

// Import icons for menu items
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ListAltIcon from '@mui/icons-material/ListAlt';
import InventoryIcon from '@mui/icons-material/Inventory';

const Restock = lazy(() => import("../../Components/Common/ManagerComponents/Restock"));
const CreateProduct = lazy(() => import("../../Components/Common/ManagerComponents/CreateProduct"));
const Dashboard = lazy(() => import("../../Components/Common/ManagerComponents/Dashboard"));
const StoreOrders = lazy(() => import("../../Components/Common/ManagerComponents/StoreOrders"));

const Manager = () => {
  const [open, setOpen] = React.useState(true);
  const { user } = useAuth(); // Destructure user from useAuth

  // Ensure the user is authenticated and has the "Manager" role
  if (!user || user.role !== 'StoreManager') {
    return <Navigate to="/login" replace />;
  }

  // Menu items for the manager sidebar
  const managerMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager/dashboard' },
    { text: 'Create Product', icon: <AddBoxIcon />, path: '/manager/create-product' },
    { text: 'Store Orders', icon: <ListAltIcon />, path: '/manager/store-orders' },
    { text: 'Restock Inventory', icon: <InventoryIcon />, path: '/manager/restock' },
  ];

  // Extract user details
  const managerName = `${user.fName} ${user.lName}`;
  const managerEmail = user.email;
  const managerInitial = user.fName.charAt(0).toUpperCase();

  return (
    <UserLayout
      menuItems={managerMenuItems}
      userName={managerName}
      userEmail={managerEmail}
      userInitial={managerInitial}
      open={open}
      setOpen={setOpen}
    >
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/store-orders" element={<StoreOrders />} />
        <Route path="/restock" element={<Restock />} />
        <Route path="/*" element={<Navigate to="/manager/dashboard" replace />} />
      </Routes>
    </UserLayout>
  );
};

export default Manager;