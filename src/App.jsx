import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from 'react';
import { Home, Login, Cart, Category, BuyProduct, Store, Profile, AboutUs, CheckOut, ChatPage, RecipesArticles, MealPlanner } from "./Pages";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './Context/CartContext';
import { MealPlannerProvider } from "./Context/MealPlannerContext";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Timer from "./Components/Timer/Timer";
import { TimerProvider } from "./Context/TimerContext";
import { LocationProvider } from "./Context/LocationContext";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

// Lazy load components
const Admin = lazy(() => import('./Pages/Administrator/Admin'));
const Shipper = lazy(() => import('./Pages/Shipper/Shipper'));
const Manager = lazy(() => import('./Pages/Manager/Manager'));

// Lazy load admin components
const AdminDashboard = lazy(() => import('./admin/Dashboard'));
// const ManageUsers = lazy(() => import('./admin/ManageUsers'));
const ManageProducts = lazy(() => import('./admin/ManageProducts'));
const ManagePromotions = lazy(() => import('./admin/ManagePromotions'));
const ManageInventory = lazy(() => import('./admin/ManageInventory'));
const ViewOrders = lazy(() => import('./admin/ViewOrders'));

// Lazy load manager components
const Dashboard = lazy(() => import("./Components/Common/ManagerComponents/Dashboard"));
const CreateProduct = lazy(() => import("./Components/Common/ManagerComponents/CreateProduct"));
const StoreOrders = lazy(() => import("./Components/Common/ManagerComponents/StoreOrders"));
const Restock = lazy(() => import("./Components/Common/ManagerComponents/Restock"));

// Loading fallback component
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading...
  </div>
);

function App() {
  const {user} = useAuth();
  return (
    <LocationProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MealPlannerProvider>
          <CartProvider>
            <TimerProvider>
              <Router>
                <div className="App">
                  <div className="content">
                    {user && user.role === 'Customer' && <Timer customerId={user.id} />}
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/Login" element={<Login />} />
                        <Route path="/Profile" element={<Profile />} />
                        <Route path="/Category/:categoryName" element={<Category />} />
                        <Route path="/Cart" element={<Cart />} />
                        <Route path="/Chat" element={<ChatPage />} />
                        <Route path="/CheckOut" element={<CheckOut />} />
                        <Route path="/Checkout/PaymentCallBack" element={<CheckOut />} />
                        <Route path="/buy-product/:productId/:storeId" element={<BuyProduct />} />
                        <Route path="/store/:storeId" element={<Store />} />
                        <Route path="/AboutUs" element={<AboutUs />} />
                        <Route path="/MealPlanner" element={<MealPlanner />} />
                        <Route path="/RecipesArticles" element={<RecipesArticles />} />
                        <Route path="/Admin/*" element={<Admin />}>
                          <Route index element={<AdminDashboard />} />
                          <Route path="manage-users" element={<ManageUsers />} />
                          <Route path="manage-products" element={<ManageProducts />} />
                          <Route path="manage-promotions" element={<ManagePromotions />} />
                          <Route path="manage-inventory" element={<ManageInventory />} />
                          <Route path="view-orders" element={<ViewOrders />} />
                        </Route>
                        <Route path="/Shipper/*" element={<Shipper />} />
                        <Route path="/manager/*" element={<Manager />}>
                          <Route index element={<Dashboard />} />
                          <Route path="create-product" element={<CreateProduct />} />
                          <Route path="store-orders" element={<StoreOrders />} />
                          <Route path="restock" element={<Restock />} />
                        </Route>
                      </Routes>
                    </Suspense>
                    <ToastContainer />
                  </div>
                </div>
              </Router>
            </TimerProvider>
          </CartProvider>
        </MealPlannerProvider>
      </LocalizationProvider>
    </LocationProvider>
  );
}

export default App;