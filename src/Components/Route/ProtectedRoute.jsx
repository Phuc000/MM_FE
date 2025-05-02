// components/Route/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ allowedRoles = null }) => {
  const { user } = useAuth();

  // Guest/customer-only route
  if (allowedRoles === null) {
    if (!user || user.role === 'Customer') {
      return <Outlet />;
    }

    // Redirect based on role
    const roleRedirectMap = {
      Admin: '/Admin',
      StoreManager: '/manager',
      Shipper: '/shipper',
    };
    return <Navigate to={roleRedirectMap[user.role] || '/Login'} replace />;
  }

  // Protected role-specific route
  if (!user) {
    // Guest user, redirect to login
    return <Navigate to="/Login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged-in user with insufficient role, show toast and navigate to Unauthorized
    toast.error('You do not have permission to access this page');
    return <Navigate to="/Unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;