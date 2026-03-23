import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Search, Eye, ChevronRight, ChevronDown, X,
  IndianRupee, TrendingUp, RotateCcw, Package, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUtils";
import Invoice from "../../../components/admin/Invoice";

const API = import.meta.env.VITE_API_URL || "/api";
const adminHeaders = { headers: { 'x-user-role': 'admin' } };

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  card: "Credit / Debit Card",
  upi: "UPI / GPay / PhonePe",
  netbanking: "Net Banking",
  wallet: "Mobile Wallet",
  razorpay: "Online Payment",
};

const getPaymentLabel = (order) => {
  const rawMethod = order.paymentMethod || "";
  let methodLabel = PAYMENT_LABELS[rawMethod.toLowerCase()] || rawMethod || "Cash on Delivery";
  if (order.paymentInfo?.method) {
    const m = order.paymentInfo.method.toLowerCase();
    const details = order.paymentInfo.methodDetails || {};
    if (m === 'card' && details.card?.network) methodLabel = `${details.card.network} Card (**** ${details.card.last4})`;
    else if (m === 'upi' && details.vpa) methodLabel = `UPI (GPay/PhonePe: ${details.vpa})`;
    else methodLabel = PAYMENT_LABELS[m] || order.paymentInfo.method;
  }
  return methodLabel;
};

const getPaymentType = (order) => {
  const method = (order.paymentInfo?.method || order.paymentMethod || "COD").toLowerCase();
  if (method === 'card') return "CARD";
  if (method === 'upi') return "UPI";
  if (method === 'razorpay') return "ONLINE";
  if (method === 'cod') return "COD";
  if (method === 'netbanking') return "NET BANKING";
  if (method === 'wallet') return "WALLET";
  return method.toUpperCase();
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPI({ label, value, icon, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: `${color}15`, color }}>{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  );
}

// ─── Dropdown pill ────────────────────────────────────────────────────────────
// counts always comes from allCounts (all orders), never filtered
function DropdownPill({ label, options, statusFilter, counts, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = options.includes(statusFilter);
  const total = options.reduce((acc, s) => acc + (counts[s] || 0), 0);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`spill flex items-center gap-1.5 ${isActive ? "spill--on" : ""}`}
      >
        {isActive ? statusFilter : label}
        <span className="spill-cnt">{total}</span>
        <ChevronDown size={12} className={`ml-0.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-100 py-1 min-w-[210px] overflow-hidden"
          >
            {options.map(s => (
              <li
                key={s}
                onMouseDown={() => { onSelect(s); setOpen(false); }}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors
                  ${statusFilter === s ? "bg-action/10 text-action font-bold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <span>{s}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold ml-3">
                  {counts[s] || 0}
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OrdersTab() {
  const { showToast } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get("status") || "All";

  // Two separate order lists:
  //   allOrders  — always fetched with NO status filter, used ONLY for badge counts
  //   orders     — fetched with the active status filter, used for the table
  const [allOrders,     setAllOrders]     = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [statusFilter,  setStatusFilter]  = useState(initialStatus);
  const [kpiStats,      setKpiStats]      = useState({
    totalRevenue: 0, totalProfit: 0, totalRefunds: 0,
    activeOrders: 0, totalUsers: 0, totalProducts: 0,
  });

  // Status groups
  const mainStatuses    = ["All", "Processing", "Shipped", "Delivered"];
  const refundStatuses  = ["Refund Tracking", "Refund Processed", "Refund Completed"];
  const replaceStatuses = ["Replacement Requested", "Replacement Processed", "Replacement Completed"];

  // ── sync filter from URL ──
  useEffect(() => {
    const s = searchParams.get("status");
    if (s && s !== statusFilter) setStatusFilter(s);
  }, [location.search]);

  // ── fetch ALL orders once (for counts) ──
  useEffect(() => {
    axios.get(`${API}/orders`, { params: { limit: 1000 } })
      .then(res => setAllOrders(res.data.orders || []))
      .catch(() => {});
  }, []);

  // ── fetch filtered orders whenever filter changes ──
  useEffect(() => { fetchOrders(); }, [statusFilter]);

  // ── KPI stats ──
  useEffect(() => {
    axios.get("/api/admin/stats").then(res => {
      setKpiStats({
        totalRevenue:  res.data.totalRevenue  || 0,
        totalProfit:   res.data.totalProfit   || 0,
        totalRefunds:  res.data.totalRefunds  || 0,
        activeOrders:  res.data.totalOrders   || 0,
        totalUsers:    res.data.totalUsers    || 0,
        totalProducts: res.data.totalProducts || 0,
      });
    }).catch(() => {});
  }, []);

  // ── enrich modal items ──
  useEffect(() => {
    if (!selectedOrder) { setEnrichedItems([]); return; }
    const items = selectedOrder.items || [];
    if (items.every(it => it.image)) { setEnrichedItems(items); return; }
    (async () => {
      const enriched = await Promise.all(items.map(async (item) => {
        if (item.image) return item;
        const pid = item.product?._id || item.product;
        if (!pid) return item;
        try {
          const res = await axios.get(`${API}/products/${pid}`);
          return { ...item, image: res.data.image || res.data.images?.[0] || "" };
        } catch { return item; }
      }));
      setEnrichedItems(enriched);
    })();
  }, [selectedOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/orders`, {
        params: { status: statusFilter === "All" ? "" : statusFilter, limit: 100 }
      });
      setOrders(res.data.orders || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusFilterChange = (s) => {
    setStatusFilter(s);
    navigate(s === "Abandoned" ? "?status=Abandoned" : "?");
  };

  // ── counts always from allOrders — never affected by active filter ──
  const allCounts = {};
  allOrders.forEach(o => {
    allCounts[o.status] = (allCounts[o.status] || 0) + 1;
  });
  const totalNonAbandoned = allOrders.filter(o => o.status !== "Abandoned").length;

  // ── filtered table rows (search only, status already handled by API) ──
  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return statusFilter === "All" ? o.status !== "Abandoned" : true;
    return (
      o._id.toLowerCase().includes(term) ||
      (o.user?.name || "").toLowerCase().includes(term) ||
      (o.guestEmail || "").toLowerCase().includes(term) ||
      (o.user?.email || "").toLowerCase().includes(term) ||
      (o.shippingAddress?.phone || "").includes(term) ||
      (o.shippingAddress?.name || "").toLowerCase().includes(term)
    );
  });

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}`, { status });
      showToast("success", `Order marked as ${status}`);
      // refresh both lists
      fetchOrders();
      axios.get(`${API}/orders`, { params: { limit: 1000 } })
        .then(res => setAllOrders(res.data.orders || [])).catch(() => {});
      if (selectedOrder?._id === id) setSelectedOrder(p => ({ ...p, status }));
    } catch { showToast("error", "Failed to update order status"); }
  };

  const updateOrderDelivery = async (id, newDate) => {
    try {
      await axios.put(`${API}/orders/${id}`, { expectedDelivery: newDate });
      showToast("success", "Expected delivery updated");
      fetchOrders();
      if (selectedOrder?._id === id) setSelectedOrder(p => ({ ...p, expectedDelivery: newDate }));
    } catch { showToast("error", "Failed to update expected delivery"); }
  };

  const getAvailableStatuses = (status) => {
    if (status === "Abandoned")           return ["Abandoned"];
    if (status?.includes("Refund"))       return refundStatuses;
    if (status?.includes("Replacement"))  return replaceStatuses;
    return ["Processing", "Shipped", "Delivered", "Cancelled"];
  };

  return (
    <div className="section-gap">

      {/* ── KPI Cards ── */}
      <div className="kpi-grid" style={{ marginBottom: "28px" }}>
        <KPI label="Total Revenue"    value={`₹${kpiStats.totalRevenue}`}                        icon={<IndianRupee size={20}/>} color="#10b981" />
        <KPI label="Total Profit"     value={`₹${Number(kpiStats.totalProfit).toFixed(0)}`}      icon={<TrendingUp size={20}/>}  color="#3b82f6" />
        <KPI label="Refund Amount"    value={`₹${kpiStats.totalRefunds}`}                        icon={<RotateCcw size={20}/>}   color="#ef4444" />
        <KPI label="Active Orders"    value={kpiStats.activeOrders}                              icon={<ShoppingCart size={20}/>} color="#f47121" />
        <KPI label="Registered Users" value={kpiStats.totalUsers}                                icon={<Users size={20}/>}       color="#8b5cf6" />
        <KPI label="Total Products"   value={kpiStats.totalProducts}                             icon={<Package size={20}/>}     color="#6366f1" />
      </div>

      {/* ── Filter bar ── */}
      {statusFilter !== "Abandoned" && (
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">

          {/* Left: pills — two rows like original */}
          <div className="flex flex-col gap-2">
            <div className="spill-row" style={{ margin: 0, flexWrap: "wrap", gap: "8px" }}>
              {/* All */}
              <button
                className={`spill ${statusFilter === "All" ? "spill--on" : ""}`}
                onClick={() => handleStatusFilterChange("All")}
              >
                All
                <span className="spill-cnt">{totalNonAbandoned}</span>
              </button>

              {/* Processing, Shipped, Delivered */}
              {mainStatuses.filter(s => s !== "All").map(s => (
                <button
                  key={s}
                  className={`spill ${statusFilter === s ? "spill--on" : ""}`}
                  onClick={() => handleStatusFilterChange(s)}
                >
                  {s}
                  <span className="spill-cnt">{allCounts[s] || 0}</span>
                </button>
              ))}

              {/* Refund dropdown */}
              <DropdownPill
                label="Refund"
                options={refundStatuses}
                statusFilter={statusFilter}
                counts={allCounts}
                onSelect={handleStatusFilterChange}
              />

              {/* Replacement dropdown */}
              <DropdownPill
                label="Replacement"
                options={replaceStatuses}
                statusFilter={statusFilter}
                counts={allCounts}
                onSelect={handleStatusFilterChange}
              />

              {/* Cancelled */}
              <button
                className={`spill ${statusFilter === "Cancelled" ? "spill--on" : ""}`}
                onClick={() => handleStatusFilterChange("Cancelled")}
              >
                Cancelled
                <span className="spill-cnt">{allCounts["Cancelled"] || 0}</span>
              </button>
            </div>
          </div>

          {/* Right: search */}
          <div className="relative w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search order ID or customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-action/20 focus:border-action transition-all placeholder:text-gray-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Orders Table ── */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="py-4 px-6 whitespace-nowrap">Order ID</th>
                <th className="py-4 px-6 whitespace-nowrap">Date</th>
                <th className="py-4 px-6 whitespace-nowrap">Customer</th>
                <th className="py-4 px-6 whitespace-nowrap">Items</th>
                <th className="py-4 px-6 whitespace-nowrap">Payment</th>
                <th className="py-4 px-6 whitespace-nowrap">Total</th>
                <th className="py-4 px-6 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(o => {
                const isStruck  = o.status === "Cancelled" || o.status === "Replacement Completed";
                const isLinked  = o.replacementFor || o.replacementOrderId;
                const tdStyle   = isStruck ? { opacity: 0.6, textDecoration: "line-through" } : {};
                const rowBg     = isLinked ? (o.replacementFor ? "rgba(124,58,237,0.05)" : "rgba(37,99,235,0.05)") : "";
                const available = getAvailableStatuses(o.status);

                return (
                  <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors" style={{ backgroundColor: rowBg }}>
                    <td className="py-4 px-6 whitespace-nowrap" style={tdStyle}>
                      <span className="font-semibold text-gray-900 border border-gray-200 bg-gray-50 px-2 py-1 rounded text-xs uppercase tracking-wider">
                        #{o._id.slice(-8)}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500 font-medium" style={tdStyle}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap" style={tdStyle}>
                      <div className="font-bold text-gray-900" style={isStruck ? { color: "#ef4444" } : {}}>
                        {o.user?.name || o.guestEmail || "Guest"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5" style={isStruck ? { color: "#ef4444" } : {}}>
                        {o.shippingAddress?.phone}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600 font-medium" style={tdStyle}>
                      <span className="bg-gray-100 px-2 py-1 rounded-md">{o.items?.length || 0} Products</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs font-bold text-gray-500 uppercase tracking-tight" style={tdStyle}>
                      {getPaymentType(o)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-900" style={tdStyle}>
                      ₹{Number(o.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap" style={tdStyle}>
                      <div className="flex flex-col gap-1">
                        <span className={`status-tag s-${o.status?.toLowerCase().replace(/ /g, "-")}`} style={isStruck ? { textDecoration: "none" } : {}}>
                          <i></i> {o.status}
                        </span>
                        {o.replacementFor && (
                          <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                            ↩ Replacement for #{o.replacementFor.slice(-8).toUpperCase()}
                          </span>
                        )}
                        {o.replacementOrderId && (
                          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                            <ChevronRight size={10}/> Replaced by #{o.replacementOrderId.slice(-8).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setSelectedOrder(o)} title="View Details"
                        >
                          <Eye size={16}/>
                        </button>
                        <button
                          className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => { setSelectedOrder(o); setTimeout(() => window.print(), 300); }} title="Print Invoice"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        </button>
                        <div className="relative flex items-center">
                          <select
                            className="appearance-none bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 h-9 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-action/50 cursor-pointer"
                            value={o.status}
                            onChange={e => updateOrderStatus(o._id, e.target.value)}
                          >
                            {available.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2.5 text-gray-400 pointer-events-none" size={14}/>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr><td colSpan="7" className="py-12 text-center text-gray-400 text-sm">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Real Invoice (Hidden on screen, visible on print) */}
            <div className="hidden print:block">
              <Invoice order={selectedOrder} />
            </div>

            <div className="modal-overlay no-print">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="modal">
              <div className="modal-head">
                <h2>Order Details <span className="order-id">#{selectedOrder._id.slice(-8)}</span></h2>
                <button className="icon-btn" onClick={() => setSelectedOrder(null)}><X size={18}/></button>
              </div>
              <div className="om-body">
                <div className="om-left">
                  <div className="om-section-title">Order Items</div>
                  <div className="activity-list" style={{ padding: 0 }}>
                    {enrichedItems.map((item, idx) => (
                      <div key={idx} className="om-item">
                        <div className="om-item-ph" style={{ position: "relative", overflow: "hidden" }}>
                          {getImageUrl(item.image || item.images?.[0]) ? (
                            <>
                              <img src={getImageUrl(item.image || item.images?.[0])} alt={item.name}
                                style={{ width:"100%",height:"100%",objectFit:"cover",position:"absolute",top:0,left:0,zIndex:10 }}
                                onError={e => { e.target.style.display = "none"; }} />
                              <span style={{ position:"relative",zIndex:0 }}>{item.name?.[0]}</span>
                            </>
                          ) : item.name?.[0]}
                        </div>
                        <div className="om-item-info">
                          <div className="om-item-name">{item.name}</div>
                          {item.variant && <div className="text-[10px] uppercase font-bold text-action tracking-wider mb-0.5">Variant: {item.variant}</div>}
                          <div className="om-item-qty">Qty: {item.quantity} × ₹{item.price}</div>
                        </div>
                        <div className="om-item-total">₹{item.quantity * item.price}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:"24px" }}>
                    <div className="om-section-title">Shipping Address</div>
                    <div style={{ background:"#f8f9fa",padding:"12px",borderRadius:"8px",fontSize:"13px" }}>
                      <strong>{selectedOrder.shippingAddress?.name}</strong><br/>
                      {selectedOrder.shippingAddress?.address}<br/>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state || ""} {selectedOrder.shippingAddress?.zip}<br/>
                      {selectedOrder.shippingAddress?.country && <>{selectedOrder.shippingAddress.country}<br/></>}
                      Phone: {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>
                </div>

                <div className="om-right">
                  <div className="om-section-title">Order Summary</div>
                  <div className="om-summary-row"><span>Subtotal</span><span>₹{selectedOrder.totalAmount}</span></div>
                  <div className="om-summary-row"><span>Shipping</span><span>₹0.00</span></div>
                  <div className="om-summary-row"><span>Payment Method</span><span className="font-bold text-action text-[11px] uppercase">{getPaymentLabel(selectedOrder)}</span></div>
                  <div className="om-summary-total"><span>Total</span><span>₹{selectedOrder.totalAmount}</span></div>

                  {(selectedOrder.replacementFor || selectedOrder.replacementOrderId) && (
                    <div style={{ marginTop:"24px",background:"#f5f3ff",border:"1px solid #ddd6fe",padding:"12px",borderRadius:"8px" }}>
                      <div className="om-section-title" style={{ color:"#7c3aed",marginBottom:"8px" }}>Order Linkage</div>
                      {selectedOrder.replacementFor && (
                        <div className="flex justify-between items-center text-[13px] mb-2">
                          <span className="text-gray-500">Replacement for</span>
                          <button onClick={() => { setSearchTerm(selectedOrder.replacementFor); setSelectedOrder(null); }} className="text-purple-600 font-bold hover:underline">
                            #{selectedOrder.replacementFor.slice(-8).toUpperCase()}
                          </button>
                        </div>
                      )}
                      {selectedOrder.replacementOrderId && (
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-gray-500">Replaced by</span>
                          <button onClick={() => { setSearchTerm(selectedOrder.replacementOrderId); setSelectedOrder(null); }} className="text-blue-600 font-bold hover:underline">
                            #{selectedOrder.replacementOrderId.slice(-8).toUpperCase()}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedOrder.cancelReason && (
                    <div style={{ marginTop:"24px",background:"#fef2f2",border:"1px solid #fee2e2",padding:"12px",borderRadius:"8px" }}>
                      <div className="om-section-title" style={{ color:"#ef4444",marginBottom:"8px" }}>Cancellation/Replace Reason</div>
                      <div style={{ fontSize:"13px",color:"#b91c1c" }}>{selectedOrder.cancelReason}</div>
                    </div>
                  )}

                  {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" &&
                   !selectedOrder.status?.includes("Refund") && !selectedOrder.status?.includes("Replacement") &&
                   selectedOrder.status !== "Abandoned" && (
                    <div style={{ marginTop:"24px" }}>
                      <div className="om-section-title">Expected Delivery Date</div>
                      <input
                        type="date"
                        className="bg-white border border-gray-200 text-sm px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 transition-shadow"
                        value={selectedOrder.expectedDelivery ? selectedOrder.expectedDelivery.split("T")[0] : ""}
                        onChange={e => updateOrderDelivery(selectedOrder._id, e.target.value)}
                      />
                    </div>
                  )}

                  <div style={{ marginTop:"24px" }}>
                    <div className="om-section-title">Update Status</div>
                    <div className="om-status-btns">
                      {getAvailableStatuses(selectedOrder.status).map(s => (
                        <button
                          key={s}
                          disabled={selectedOrder.status === s}
                          className={`od-st-btn ${selectedOrder.status === s ? "od-st-btn--on" : ""}`}
                          onClick={() => updateOrderStatus(selectedOrder._id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button className="btn-secondary" onClick={() => window.print()}>Print Invoice</button>
                <button className="btn-primary" onClick={() => setSelectedOrder(null)}>Close</button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}