import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  MoreVertical,
  ChevronDown,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUtils";

const API = "/api";

export default function OrdersTab() {
  const { showToast } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get("status") || "All";

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const mainStatuses = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  const subStatuses = ["Refund Tracking", "Refund Processed", "Refund Completed", "Replacement Requested", "Replacement Processed", "Replacement Completed"];

  useEffect(() => {
    const s = searchParams.get("status");
    if (s && s !== statusFilter) {
      setStatusFilter(s);
    } else if (!s && statusFilter === "Abandoned") { // reset if came from abandoned back to general orders
      setStatusFilter("All");
    }
  }, [location.search]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusFilterChange = (s) => {
    setStatusFilter(s);
    if (s === "Abandoned") {
      navigate("?status=Abandoned");
    } else {
      navigate("?");
    }
  };

  // When an order is selected, enrich items with product images (for older orders that may not have image stored)
  useEffect(() => {
    if (!selectedOrder) { setEnrichedItems([]); return; }
    const items = selectedOrder.items || [];
    // If all items already have images, skip fetching
    if (items.every(it => it.image)) {
      setEnrichedItems(items);
      return;
    }
    (async () => {
      const enriched = await Promise.all(items.map(async (item) => {
        if (item.image) return item;
        const productId = item.product?._id || item.product;
        if (!productId) return item;
        try {
          const res = await axios.get(`${API}/products/${productId}`);
          const product = res.data;
          return { ...item, image: product.image || product.images?.[0] || '' };
        } catch {
          return item;
        }
      }));
      setEnrichedItems(enriched);
    })();
  }, [selectedOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/orders`, {
        params: { status: statusFilter === "All" ? "" : statusFilter, limit: 100 } // Fetch more for local filtering/display
      });
      setOrders(res.data.orders || []);
      setTotalOrders(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      o._id.toLowerCase().includes(term) || 
      (o.user?.name || "").toLowerCase().includes(term) ||
      (o.guestEmail || "").toLowerCase().includes(term) ||
      (o.user?.email || "").toLowerCase().includes(term) ||
      (o.shippingAddress?.phone || "").includes(term) ||
      (o.shippingAddress?.name || "").toLowerCase().includes(term);
    const matchesStatus = statusFilter === "All" ? o.status !== "Abandoned" : o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}`, { status });
      showToast("success", `Order marked as ${status}`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      showToast("error", "Failed to update order status");
    }
  };

  const updateOrderDelivery = async (id, newDate) => {
    try {
      await axios.put(`${API}/orders/${id}`, { expectedDelivery: newDate });
      showToast("success", "Expected delivery updated");
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, expectedDelivery: newDate });
      }
    } catch (err) {
      showToast("error", "Failed to update expected delivery");
    }
  };

  return (
    <div className="section-gap">
      {statusFilter !== "Abandoned" && (
        <>
          <div className="spill-row">
            {mainStatuses.map(s => (
              <button
                key={s}
                className={`spill ${statusFilter === s ? 'spill--on' : ''}`}
                onClick={() => handleStatusFilterChange(s)}
              >
                {s}
                <span className="spill-cnt">
                  {s === "All" ? orders.filter(o => o.status !== "Abandoned").length : orders.filter(o => o.status === s).length}
                </span>
              </button>
            ))}
          </div>
          <div className="spill-row" style={{ marginTop: '12px' }}>
            {subStatuses.map(s => (
              <button
                key={s}
                className={`spill ${statusFilter === s ? 'spill--on' : ''}`}
                onClick={() => handleStatusFilterChange(s)}
              >
                {s}
                <span className="spill-cnt">
                  {orders.filter(o => o.status === s).length}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center gap-4 mb-6 mt-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-action/20 focus:border-action transition-all shadow-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="py-4 px-6 whitespace-nowrap">Order ID</th>
                <th className="py-4 px-6 whitespace-nowrap">Date</th>
                <th className="py-4 px-6 whitespace-nowrap">Customer</th>
                <th className="py-4 px-6 whitespace-nowrap">Items</th>
                <th className="py-4 px-6 whitespace-nowrap">Total</th>
                <th className="py-4 px-6 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {filteredOrders.map(o => {
              const isStruck = o.status === "Cancelled" || o.status === "Replacement Completed";
              const isLinked = o.replacementFor || o.replacementOrderId;
              const tdStyle = isStruck ? { opacity: 0.6, textDecoration: 'line-through' } : {};
              const rowBg = isLinked ? (o.replacementFor ? 'rgba(124, 58, 237, 0.05)' : 'rgba(37, 99, 235, 0.05)') : '';
              
              const getAvailableStatuses = (status) => {
                if (status === "Abandoned") return ["Abandoned"];
                if (status?.includes("Refund")) return ["Refund Tracking", "Refund Processed", "Refund Completed"];
                if (status?.includes("Replacement")) return ["Replacement Requested", "Replacement Processed", "Replacement Completed"];
                return ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
              };
              
              const availableOptions = getAvailableStatuses(o.status);

              return (
              <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" style={{ backgroundColor: rowBg }}>
                <td className="py-4 px-6 whitespace-nowrap" style={tdStyle}><span className="font-semibold text-gray-900 border border-gray-200 bg-gray-50 px-2 py-1 rounded text-xs uppercase tracking-wider">#{o._id.slice(-8)}</span></td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500 font-medium" style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="py-4 px-6 whitespace-nowrap" style={{...tdStyle}}>
                  <div className="font-bold text-gray-900" style={isStruck ? { color: '#ef4444'} : {}}>{o.user?.name || o.guestEmail || "Guest"}</div>
                  <div className="text-xs text-gray-500 mt-0.5" style={isStruck ? { color: '#ef4444'} : {}}>{o.shippingAddress?.phone}</div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600 font-medium" style={{...tdStyle}}><span className="bg-gray-100 px-2 py-1 rounded-md">{o.items?.length || 0} Products</span></td>
                <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-900" style={{...tdStyle}}>₹{Number(o.totalAmount || 0).toLocaleString()}</td>
                <td className="py-4 px-6 whitespace-nowrap" style={{...tdStyle}}>
                  <div className="flex flex-col gap-1">
                    <span className={`status-tag s-${o.status?.toLowerCase().replace(' ', '-')}`} style={isStruck ? { textDecoration: 'none' } : {}}>
                      <i></i> {o.status}
                    </span>
                    {o.replacementFor && (
                      <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                        <ArrowLeft size={10} /> Replacement for #{o.replacementFor.slice(-8).toUpperCase()}
                      </span>
                    )}
                    {o.replacementOrderId && (
                      <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                        <ChevronRight size={10} /> Replaced by #{o.replacementOrderId.slice(-8).toUpperCase()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setSelectedOrder(o)} title="View Details"><Eye size={16} /></button>
                    <button className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors" onClick={() => { setSelectedOrder(o); setTimeout(() => window.print(), 300); }} title="Print Invoice">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    </button>
                    <div className="relative flex items-center">
                      <select
                        className="appearance-none bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 h-9 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-action/50 cursor-pointer text-left"
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                      >
                        {availableOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </td>
              </tr>
            )})}
            {filteredOrders.length === 0 && <tr><td colSpan="7" className="py-12 text-center text-gray-400 text-sm">No orders found matching criteria</td></tr>}
          </tbody>
        </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="modal-overlay">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="modal">
              <div className="modal-head">
                <h2>Order Details <span className="order-id">#{selectedOrder._id.slice(-8)}</span></h2>
                <button className="icon-btn" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
              </div>
              <div className="om-body">
                <div className="om-left">
                  <div className="om-section-title">Order Items</div>
                  <div className="activity-list" style={{ padding: 0 }}>
                    {enrichedItems.map((item, idx) => (
                      <div key={idx} className="om-item">
                        <div className="om-item-ph" style={{ position: 'relative', overflow: 'hidden' }}>
                          {getImageUrl(item.image || item.images?.[0]) ? (
                            <>
                              <img
                                src={getImageUrl(item.image || item.images?.[0])}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 10 }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <span style={{ position: 'relative', zIndex: 0 }}>{item.name?.[0]}</span>
                            </>
                          ) : (
                            item.name?.[0]
                          )}
                        </div>
                        <div className="om-item-info">
                          <div className="om-item-name">{item.name}</div>
                          {item.variant && (
                            <div className="text-[10px] uppercase font-bold text-action tracking-wider mb-0.5">Variant: {item.variant}</div>
                          )}
                          <div className="om-item-qty">Qty: {item.quantity} × ₹{item.price}</div>
                        </div>
                        <div className="om-item-total">₹{item.quantity * item.price}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <div className="om-section-title">Shipping Address</div>
                    <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                      <strong>{selectedOrder.shippingAddress?.name}</strong><br />
                      {selectedOrder.shippingAddress?.address}<br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.zip}<br />
                      Phone: {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>
                </div>

                <div className="om-right">
                  <div className="om-section-title">Order Summary</div>
                  <div className="om-summary-row"><span>Subtotal</span><span>₹{selectedOrder.totalAmount}</span></div>
                  <div className="om-summary-row"><span>Shipping</span><span>₹0.00</span></div>
                  <div className="om-summary-total"><span>Total</span><span>₹{selectedOrder.totalAmount}</span></div>

                  {(selectedOrder.replacementFor || selectedOrder.replacementOrderId) && (
                    <div style={{ marginTop: '24px', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '12px', borderRadius: '8px' }}>
                      <div className="om-section-title" style={{ color: '#7c3aed', marginBottom: '8px' }}>Order Linkage</div>
                      {selectedOrder.replacementFor && (
                        <div className="flex justify-between items-center text-[13px] mb-2">
                          <span className="text-gray-500">Replacement for</span>
                          <button 
                            onClick={() => {
                              setSearchTerm(selectedOrder.replacementFor);
                              setSelectedOrder(null);
                            }}
                            className="text-purple-600 font-bold hover:underline"
                          >
                            #{selectedOrder.replacementFor.slice(-8).toUpperCase()}
                          </button>
                        </div>
                      )}
                      {selectedOrder.replacementOrderId && (
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-gray-500">Replaced by</span>
                          <button 
                            onClick={() => {
                              setSearchTerm(selectedOrder.replacementOrderId);
                              setSelectedOrder(null);
                            }}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            #{selectedOrder.replacementOrderId.slice(-8).toUpperCase()}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedOrder.cancelReason && (
                    <div style={{ marginTop: '24px', background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: '8px' }}>
                      <div className="om-section-title" style={{ color: '#ef4444', marginBottom: '8px' }}>Cancellation/Replace Reason</div>
                      <div style={{ fontSize: '13px', color: '#b91c1c' }}>{selectedOrder.cancelReason}</div>
                    </div>
                  )}

                  {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && !selectedOrder.status?.includes("Refund") && !selectedOrder.status?.includes("Replacement") && selectedOrder.status !== "Abandoned" && (
                    <div style={{ marginTop: '24px' }}>
                      <div className="om-section-title">Expected Delivery Date</div>
                      <input 
                        type="date"
                        className="bg-white border border-gray-200 text-sm px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange/50 transition-shadow"
                        value={selectedOrder.expectedDelivery ? selectedOrder.expectedDelivery.split('T')[0] : ''}
                        onChange={(e) => updateOrderDelivery(selectedOrder._id, e.target.value)}
                      />
                    </div>
                  )}

                  <div style={{ marginTop: '24px' }}>
                    <div className="om-section-title">Update Status</div>
                    <div className="om-status-btns">
                      {(() => {
                        const getAvailableStatuses = (status) => {
                          if (status === "Abandoned") return ["Abandoned"];
                          if (status?.includes("Refund")) return ["Refund Tracking", "Refund Processed", "Refund Completed"];
                          if (status?.includes("Replacement")) return ["Replacement Requested", "Replacement Processed", "Replacement Completed"];
                          return ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
                        };
                        return getAvailableStatuses(selectedOrder.status);
                      })().map(s => (
                        <button
                          key={s}
                          disabled={selectedOrder.status === s}
                          className={`od-st-btn ${selectedOrder.status === s ? 'od-st-btn--on' : ''}`}
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
        )}
      </AnimatePresence>
    </div>
  );
}

