// src/Manager.jsx
import React, { Suspense } from "react";
import { Outlet, Navigate } from 'react-router-dom';
import UserLayout from '../../Components/UserLayout/UserLayout';
import { useAuth } from '../../hooks/useAuth';

// Import icons for menu items
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ListAltIcon from '@mui/icons-material/ListAlt';
import InventoryIcon from '@mui/icons-material/Inventory';

// Loading spinner while lazy loading children
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading...
  </div>
);

const Manager = () => {
  const [open, setOpen] = React.useState(true);
  const { user } = useAuth();

  // Ensure the user is authenticated and has the "StoreManager" role
  if (!user || user.role !== 'StoreManager') {
    return <Navigate to="/login" replace />;
  }

  const managerMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager' },
    // { text: 'Create Product', icon: <AddBoxIcon />, path: '/manager/create-product' },
    { text: 'Store Orders', icon: <ListAltIcon />, path: '/manager/store-orders' },
    { text: 'Restock Inventory', icon: <InventoryIcon />, path: '/manager/restock' },
    
  ];

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
      {/* Wrap Outlet with Suspense for lazy loading */}
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </UserLayout>
  );
};

export default Manager;
