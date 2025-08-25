import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductSearch from './pages/ProductsSearch';
import Customers from './pages/Customers';
import Purchases from './pages/Purchases';
import ServiceRequest from './pages/ServiceRequest';
import TransactionHistory from './pages/TransactionHistory';
import ProductDetails from './pages/ProductDetails';
import CustomerInfo from './pages/CustomerInfo';
import PurchaseHistory from './pages/PurchaseHistory';
import RegisterProduct from './pages/RegisterProduct';
import FareDisputes from './pages/FareDisputes';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { useAuth } from './context/AuthContext';

const Routes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/product-search"
        element={
          <ProtectedRoute>
            <ProductSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <Purchases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-request"
        element={
          <ProtectedRoute>
            <ServiceRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transaction-history"
        element={
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <CustomerInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases/:productId"
        element={
          <ProtectedRoute>
            <PurchaseHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register-product"
        element={
          <ProtectedRoute>
            <RegisterProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fare-disputes"
        element={
          <ProtectedRoute>
            <FareDisputes />
          </ProtectedRoute>
        }
      />

      {/* Catch all route - redirect to login if not authenticated, home if authenticated */}
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
        }
      />
    </RouterRoutes>
  );
};

export default Routes; 