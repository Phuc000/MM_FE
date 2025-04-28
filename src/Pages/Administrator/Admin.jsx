// src/Admin.jsx
import React from 'react';
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

const Admin = () => {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(true);

  // prevent unauthenticated users from accessing the admin page
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  // Menu items for the admin sidebar
  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Manage Products', icon: <ShoppingCartIcon />, path: '/admin/manage-products' },
    { text: 'Manage Inventory', icon: <InventoryIcon />, path: '/admin/manage-inventory' },
    { text: 'Manage Promotions', icon: <LocalOfferIcon />, path: '/admin/manage-promotions' },
    { text: 'View Orders', icon: <ShoppingBagIcon />, path: '/admin/view-orders' },
    // { text: 'Manage Users', icon: <PeopleIcon />, path: '/admin/manage-users' },
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
      <Outlet />
    </UserLayout>
  );
};

export default Admin;