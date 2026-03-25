import React, { useState, useEffect, useRef } from "react";
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
  XCircle,
  HelpCircle,
  Bell,
  X,
  Plus,
  Star,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "../../styles/admin.css";

import Logo from "../../assets/cromsen.png";

const API = import.meta.env.VITE_API_URL || "/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [showToastMsg, setShowToastMsg] = useState({ show: false, type: "success", text: "" });
  const [newOrderNotify, setNewOrderNotify] = useState(null);
  const knownOrdersRef = useRef(new Set());
  const isFirstPollRef = useRef(true);
  
  // Stats are shared or managed by OverviewTab, but we can keep basic stats here for topbar if needed
  const [orderCount, setOrderCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [inquiriesCount, setInquiriesCount] = useState(0);

  let user = { name: "Admin", role: "main" };
  try {
    const sessionUser = localStorage.getItem("cromsen_user");
    const sessionRole = localStorage.getItem("cromsen_role");
    if (sessionUser) {
      user = { name: sessionUser, role: sessionRole || "sub" };
    }
  } catch (e) {
    console.error("Session data error", e);
  }

  useEffect(() => {
    const isAuth = localStorage.getItem("cromsen_auth");
    const expireTime = localStorage.getItem("cromsen_auth_expire");
    const now = new Date().getTime();

    if (!isAuth || !expireTime || now > parseInt(expireTime)) {
      ['cromsen_auth', 'cromsen_user', 'cromsen_role', 'cromsen_uid', 'cromsen_auth_expire']
        .forEach(k => localStorage.removeItem(k));
      navigate("/admin/login");
      return;
    }
    
    // Initial fetch to get baseline count and other stats
    fetchOrderCount();
    
    // Polling every 15 seconds
    const interval = setInterval(fetchOrderCount, 15000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Mark inquiries as "seen" when the user opens the Inquiries tab
  useEffect(() => {
    if (location.pathname === "/admin/inquiries") {
      localStorage.setItem("lastSeenInquiries", new Date().toISOString());
      setInquiriesCount(0);
    }
  }, [location.pathname]);

  const fetchOrderCount = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`); // Assuming this endpoint provides totalOrders
      const currentCount = res.data.totalOrders || 0;
      setOrderCount(currentCount); // Update for the topbar display

      // Fetch pending orders for badge
      try {
        const pendingRes = await axios.get(`${API}/orders`, { params: { status: "Pending" } });
        setPendingOrdersCount(pendingRes.data.orders?.length || pendingRes.data.length || 0);
      } catch (e) {}

      // Fetch active inquiries for badge — only count NEW ones since last viewed
      try {
        const inqRes = await axios.get(`${API}/inquiries`);
        const inqList = inqRes.data.inquiries || inqRes.data || [];
        const lastSeen = localStorage.getItem("lastSeenInquiries");
        
        if (location.pathname === "/admin/inquiries") {
          // Currently on the inquiries page — no badge needed
          setInquiriesCount(0);
        } else if (lastSeen) {
          // Count only enquiries received AFTER the last time the page was visited
          const lastSeenDate = new Date(lastSeen);
          const newInquiries = inqList.filter(inq => new Date(inq.createdAt) > lastSeenDate);
          setInquiriesCount(newInquiries.length);
        } else {
          // First-ever login: set "now" as the baseline — don't count existing enquiries as new
          localStorage.setItem("lastSeenInquiries", new Date().toISOString());
          setInquiriesCount(0);
        }
      } catch (e) {}

      // Check for new non-abandoned orders using a Set
      try {
        const latestOrderRes = await axios.get(`${API}/orders`, { params: { limit: 10 } });
        const validOrders = (latestOrderRes.data.orders || []).filter(o => o.status !== "Abandoned");
        
        if (isFirstPollRef.current) {
          validOrders.forEach(o => knownOrdersRef.current.add(o._id));
          isFirstPollRef.current = false;
        } else {
          const newOrders = validOrders.filter(o => !knownOrdersRef.current.has(o._id));
          if (newOrders.length > 0) {
            setNewOrderNotify(newOrders[0]);
            newOrders.forEach(o => knownOrdersRef.current.add(o._id));
          }
        }
      } catch (err) {
        console.error("Error checking latest orders:", err);
      }

    } catch (err) {
      console.error("Poll error:", err);
    } finally {
      setLoading(false); // Set loading to false after initial fetch
    }
  };

  const showToast = (type, text) => {
    setShowToastMsg({ show: true, type, text });
    setTimeout(() => setShowToastMsg({ show: false, type: "success", text: "" }), 3000);
  };

  const handleLogout = () => {
    ['cromsen_auth', 'cromsen_user', 'cromsen_role', 'cromsen_uid', 'cromsen_auth_expire']
      .forEach(k => localStorage.removeItem(k));
    navigate("/admin/login");
  };

  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (path === "admin") return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="admin-root admin-theme">
      {showToastMsg.show && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`toast toast--${showToastMsg.type}`}>
          {showToastMsg.type === "success" ? <CheckCircle size={14}/> : <XCircle size={14}/>}
          {showToastMsg.text}
        </motion.div>
      )}

      {/* New Order Notification Popup */}
      <AnimatePresence>
        {newOrderNotify && (
          <motion.div 
            initial={{ opacity: 0, y: 100, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[2000] w-80 bg-white rounded-2xl shadow-2xl border-2 border-orange border-l-[6px] overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-orange/10 p-2 rounded-lg text-orange">
                  <Bell size={20} className="animate-bounce" />
                </div>
                <button 
                  onClick={() => setNewOrderNotify(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">New Order Placed!</h4>
                <p className="text-sm text-gray-500 mt-1">
                   Order <span className="font-mono text-orange font-bold">#{newOrderNotify._id?.slice(-8).toUpperCase()}</span> just arrived.
                </p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Amount</p>
                    <p className="font-bold text-gray-900">₹{newOrderNotify.totalAmount}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setNewOrderNotify(null);
                      navigate("/admin/orders");
                    }}
                    className="bg-orange text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors"
                  >
                    <ShoppingCart size={14} /> View Orders
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="sidebar">
        <div className="sidebar-brand flex items-center justify-between">
          <div>
            <div className="brand-name">Cromsen</div>
            <div className="brand-sub">Admin Control</div>
          </div>
          <button 
            onClick={() => navigate('/admin/settings')} 
            className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all ml-auto"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
        <div className="sb-section-label">Main Menu</div>
        <nav>
          <SidebarLink to="/admin" icon={<Layout size={18}/>} label="Dashboard" active={location.pathname === "/admin"} />
          <SidebarLink to="/admin/inventory" icon={<Package size={18}/>} label="Inventory" active={location.pathname === "/admin/inventory"} />
          <SidebarLink to="/admin/categories" icon={<Layers size={18}/>} label="Categories" active={location.pathname === "/admin/categories"} />
          <SidebarLink to="/admin/orders" icon={<ShoppingCart size={18}/>} label="Orders" active={location.pathname === "/admin/orders" && !location.search.includes("status=Abandoned")} badge={location.pathname.startsWith("/admin/orders") ? 0 : pendingOrdersCount} />
          <SidebarLink to="/admin/customers" icon={<Users size={18}/>} label="Customers" active={location.pathname === "/admin/customers"} />
          <SidebarLink to="/admin/homepage" icon={<Layout size={18}/>} label="Homepage" active={location.pathname === "/admin/homepage"} />
          <SidebarLink to="/admin/inquiries" icon={<HelpCircle size={18}/>} label="Enquiries" active={location.pathname === "/admin/inquiries"} badge={location.pathname === "/admin/inquiries" ? 0 : inquiriesCount} />
          <SidebarLink to="/admin/reviews" icon={<Star size={18}/>} label="Reviews" active={location.pathname === "/admin/reviews"} />
          <SidebarLink to="/admin/policies" icon={<FileText size={18}/>} label="Policy" active={location.pathname === "/admin/policies"} />
        </nav>
        {user.role === "main" && (
          <>
            <div className="sb-section-label">Administration</div>
            <nav>
              <SidebarLink to="/admin/admins" icon={<Shield size={18}/>} label="Admins" active={location.pathname === "/admin/admins"} />
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
    </div>
  );
}

function SidebarLink({ to, icon, label, active, badge, style }) {
  return (
    <Link to={to} className={`sb-item ${active ? 'sb-item--on' : ''}`} style={style}>
      {icon}<span>{label}</span>{badge > 0 && <span className="sb-badge sb-badge--red">{badge}</span>}
    </Link>
  );
}
