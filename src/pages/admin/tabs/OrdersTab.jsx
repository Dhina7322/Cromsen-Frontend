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
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUtils";

const API = "/api";

export default function OrdersTab() {
  const { showToast } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [enrichedItems, setEnrichedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refund Tracking", "Refund Processed", "Refund Delivered", "Abandoned"];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

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
    const matchesSearch = o._id.includes(searchTerm) || (o.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
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

  return (
    <div className="section-gap">
      <div className="spill-row">
        {statuses.map(s => (
          <button
            key={s}
            className={`spill ${statusFilter === s ? 'spill--on' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
            <span className="spill-cnt">
              {s === "All" ? orders.length : orders.filter(o => o.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="searchbox">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => {
              const isStruck = o.status === "Cancelled" || o.status.includes("Refund") || o.status === "Abandoned";
              const tdStyle = isStruck ? { textDecoration: 'line-through', color: '#ef4444', opacity: 0.8 } : {};
              
              const getAvailableStatuses = (status) => {
                if (status === "Abandoned") return ["Abandoned"];
                if (status.includes("Refund")) return ["Refund Tracking", "Refund Processed", "Refund Delivered"];
                return ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
              };
              
              const availableOptions = getAvailableStatuses(o.status);

              return (
              <tr key={o._id}>
                <td style={tdStyle}><span className="order-id">#{o._id.slice(-8)}</span></td>
                <td className="date-cell" style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <div className="cust-name" style={isStruck ? { color: '#ef4444'} : {}}>{o.user?.name || o.guestEmail || "Guest"}</div>
                  <div className="cust-phone" style={isStruck ? { color: '#ef4444'} : {}}>{o.shippingAddress?.phone}</div>
                </td>
                <td style={tdStyle}>{o.items?.length || 0} Products</td>
                <td className="amt" style={tdStyle}>₹{o.totalAmount}</td>
                <td style={tdStyle}>
                  <span className={`status-tag s-${o.status?.toLowerCase().replace(' ', '-')}`} style={isStruck ? { textDecoration: 'none' } : {}}>
                    <i></i> {o.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="row-acts">
                    <button className="icon-btn" onClick={() => setSelectedOrder(o)} title="View Details"><Eye size={14} /></button>
                    <button className="icon-btn" onClick={() => { setSelectedOrder(o); setTimeout(() => window.print(), 300); }} title="Print Invoice">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    </button>
                    <select
                      className="inline-select"
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                    >
                      {availableOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            )})}
            {filteredOrders.length === 0 && <tr><td colSpan="7" className="empty-row">No orders found matching criteria</td></tr>}
          </tbody>
        </table>
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

                  {selectedOrder.cancelReason && (
                    <div style={{ marginTop: '24px', background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: '8px' }}>
                      <div className="om-section-title" style={{ color: '#ef4444', marginBottom: '8px' }}>Cancellation Reason</div>
                      <div style={{ fontSize: '13px', color: '#b91c1c' }}>{selectedOrder.cancelReason}</div>
                    </div>
                  )}

                  <div style={{ marginTop: '24px' }}>
                    <div className="om-section-title">Update Status</div>
                    <div className="om-status-btns">
                      {(() => {
                        const getAvailableStatuses = (status) => {
                          if (status === "Abandoned") return ["Abandoned"];
                          if (status.includes("Refund")) return ["Refund Tracking", "Refund Processed", "Refund Delivered"];
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

