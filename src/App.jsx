import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Services from './pages/Services';
import Checkout from './pages/Checkout';

import { useLocation } from 'react-router-dom';

// Simplified Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import DashboardOverviewWrapper from './pages/admin/tabs/DashboardOverviewWrapper';
import InventoryTab from './pages/admin/tabs/InventoryTab';
import CategoriesTab from './pages/admin/tabs/CategoriesTab';
import OrdersTab from './pages/admin/tabs/OrdersTab';
import UsersTab from './pages/admin/tabs/UsersTab';
import AdminsTab from './pages/admin/tabs/AdminsTab';
import SettingsTab from './pages/admin/tabs/SettingsTab';

import { useState, useEffect } from 'react';
import RoleSelector from './components/RoleSelector';

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleRoleSelect = (role) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
  };

  useEffect(() => {
    // Check if role is set, if not we show selector
  }, []);

  if (!userRole && !isAdminRoute) {
    return <RoleSelector onSelect={handleRoleSelect} />;
  }

  const isLoginPage = location.pathname === '/admin/login';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && !isLoginPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/services" element={<Services />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* Admin Routes Consolidated */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />}>
             <Route index element={<DashboardOverviewWrapper />} />
             <Route path="inventory" element={<InventoryTab />} />
             <Route path="categories" element={<CategoriesTab />} />
             <Route path="orders" element={<OrdersTab />} />
             <Route path="customers" element={<UsersTab />} />
             <Route path="admins" element={<AdminsTab />} />
             <Route path="settings" element={<SettingsTab />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && !isLoginPage && <Footer />}
    </div>
  );
}

export default App;
