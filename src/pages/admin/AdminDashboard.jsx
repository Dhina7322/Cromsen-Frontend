import React, { useState, useEffect } from "react";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Clock, 
  Layout, 
  Shield,
  Layers,
  CheckCircle,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "../../styles/admin.css";

const API = "/api";

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: "Admin", role: "main" });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Stats are shared or managed by OverviewTab, but we can keep basic stats here for topbar if needed
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const isAuth = sessionStorage.getItem("cromsen_auth");
    if (!isAuth) {
      navigate("/admin/login");
      return;
    }
    const storedUser = sessionStorage.getItem("cromsen_user");
    const storedRole = sessionStorage.getItem("cromsen_role");
    setUser({ name: storedUser || "Admin", role: storedRole || "sub" });
    
    // Fetch basic stats for the badge in sidebar
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/admin/stats`);
        setOrderCount(res.data.totalOrders || 0);
      } catch (err) {
        console.error("Layout stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/admin/login");
  };

  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (path === "admin") return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="admin-root admin-theme">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">C</div>
          <div>
            <div className="brand-name">Cromsen</div>
            <div className="brand-sub">Admin Control</div>
          </div>
        </div>
        <div className="sb-section-label">Main Menu</div>
        <nav>
          <SidebarLink to="/admin" icon={<Layout size={18}/>} label="Dashboard" active={location.pathname === "/admin"} />
          <SidebarLink to="/admin/inventory" icon={<Package size={18}/>} label="Inventory" active={location.pathname === "/admin/inventory"} />
          <SidebarLink to="/admin/categories" icon={<Layers size={18}/>} label="Categories" active={location.pathname === "/admin/categories"} />
          <SidebarLink to="/admin/orders" icon={<ShoppingCart size={18}/>} label="Orders" active={location.pathname === "/admin/orders"} badge={0} />
          <SidebarLink to="/admin/customers" icon={<Users size={18}/>} label="Customers" active={location.pathname === "/admin/customers"} />
        </nav>
        {user.role === "main" && (
          <>
            <div className="sb-section-label">Administration</div>
            <nav>
              <SidebarLink to="/admin/admins" icon={<Shield size={18}/>} label="Admins" active={location.pathname === "/admin/admins"} />
              <SidebarLink to="/admin/settings" icon={<Settings size={18}/>} label="Settings" active={location.pathname === "/admin/settings"} />
            </nav>
          </>
        )}
        <div className="sb-user">
          <div className="sb-avatar">{user.name ? user.name[0] : "A"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div className="sb-user-role">{user.role === "main" ? "Super Admin" : "Editor"}</div>
          </div>
          <button className="sb-logout" onClick={handleLogout}><LogOut size={14} title="Logout" /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <h2 className="topbar-title">{getPageTitle()}</h2>
          <div className="topbar-right">
             <button className="topbar-btn" onClick={() => window.location.reload()}><Clock size={14} /> Refresh</button>
             <div style={{ width: 1, height: 20, background: "#eee", margin: "0 10px" }} />
             <span className="pending-pill">{orderCount} Total Orders</span>
          </div>
        </header>

        <section className="content">
          {loading ? (
             <div className="flex items-center justify-center h-full"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full" /></div>
          ) : (
            <Outlet context={{ user, showToast }} />
          )}
        </section>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`toast toast--${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={14}/> : <XCircle size={14}/>}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLink({ to, icon, label, active, badge }) {
  return (
    <Link to={to} className={`sb-item ${active ? 'sb-item--on' : ''}`}>
      {icon}<span>{label}</span>{badge > 0 && <span className="sb-badge sb-badge--red">{badge}</span>}
    </Link>
  );
}
