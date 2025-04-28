// src/Admin.jsx
import React, {Suspense} from 'react';
import { Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import UserLayout from '../../Components/UserLayout/UserLayout';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// Your loading spinner
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading...
  </div>
);


const Admin = () => {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(true);

  // prevent unauthenticated users from accessing the admin page
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  // Menu items for the admin sidebar
  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/Admin' },
    { text: 'Manage Products', icon: <ShoppingCartIcon />, path: '/Admin/manage-products' },
    { text: 'Manage Inventory', icon: <InventoryIcon />, path: '/Admin/manage-inventory' },
    { text: 'Manage Promotions', icon: <LocalOfferIcon />, path: '/Admin/manage-promotions' },
    { text: 'View Orders', icon: <ShoppingBagIcon />, path: '/Admin/view-orders' },
    { text: 'Manage Users', icon: <PeopleIcon />, path: '/Admin/manage-users' },
  ];

  return (
    <UserLayout
      menuItems={adminMenuItems}
      userName={`${user.fName} ${user.lName}`}
      userEmail={user.email}
      userInitial={user.fName.charAt(0)}
      open={open}
      setOpen={setOpen}
    >
      {/* Suspense wraps Outlet */}
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </UserLayout>
  );
};

export default Admin;