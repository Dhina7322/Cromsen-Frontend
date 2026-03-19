import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./orders.css";

const API = ""; // uses Vite proxy → /api → localhost:5001

const STATUS_STEPS = [
  { label: "Order Placed",     key: "createdAt",        offset: 0 },
  { label: "Processing",       key: "processingAt",     offset: 1 },
  { label: "Shipped",          key: "shippedAt",        offset: 2 },
  { label: "Out for Delivery", key: "outForDeliveryAt", offset: 4 },
  { label: "Delivered",        key: "deliveredAt",      offset: 5 },
];

const STATUS_IDX = {
  "Pending": 0, "Processing": 1, "Shipped": 2,
  "Out for Delivery": 3, "Delivered": 4, "Cancelled": -1, "Refund Tracking": -1,
};

const REFUND_STEPS = [
  { label: "Cancelled",        key: "cancelledAt",       offset: 0 },
  { label: "Refund Initiated", key: "refundInitiatedAt", offset: 0 },
  { label: "Refund Processed", key: "refundProcessedAt", offset: 3 },
  { label: "Refund Completed", key: "refundCompletedAt", offset: 5 },
];

const REFUND_IDX = {
  "Refund Tracking": 1,
  "Refund Processed": 2,
  "Refund Completed": 3,
};

const REPLACE_STEPS = [
  { label: "Replacement Requested", key: "replacementRequestedAt", offset: 0 },
  { label: "Replacement Processed", key: "replacementProcessedAt", offset: 2 },
  { label: "Replacement Completed", key: "replacementCompletedAt", offset: 5 },
];

const REPLACE_IDX = {
  "Replacement Requested": 0,
  "Replacement Processed": 1,
  "Replacement Completed": 2,
};

const STATUS_COLORS = {
  Pending:           { color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
  Processing:        { color: "#38bdf8", bg: "rgba(56,189,248,0.15)"  },
  Shipped:           { color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
  "Out for Delivery":{ color: "#fb923c", bg: "rgba(251,146,60,0.15)"  },
  Delivered:         { color: "#22c55e", bg: "rgba(34,197,94,0.15)"   },
  Cancelled:         { color: "#f87171", bg: "rgba(248,113,113,0.15)" },
  "Refund Tracking": { color: "#ef4444", bg: "rgba(239,68,68,0.15)"  },
  "Refund Processed":{ color: "#eab308", bg: "rgba(234,179,8,0.15)"   },
  "Refund Completed":{ color: "#22c55e", bg: "rgba(34,197,94,0.15)"   },
  "Replacement Requested": { color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
  "Replacement Processed": { color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
  "Replacement Completed": { color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  Abandoned:         { color: "#6b7280", bg: "rgba(107,114,128,0.15)" },
};

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  card: "Credit / Debit Card",
  upi: "UPI / GPay / PhonePe",
  netbanking: "Net Banking",
  wallet: "Mobile Wallet",
  razorpay: "Online Payment",
};

const CANCEL_REASONS = [
  "I want to change my delivery address",
  "I want to cancel and reorder to use a coupon",
  "I want to change the payment method",
  "I accidentally ordered the wrong item",
  "I found a better price elsewhere",
  "Delivery time is too long",
  "Duplicate order placed by mistake",
  "Other reason",
];

const REPLACE_REASONS = [
  "Item is defective or broken",
  "Item does not match description",
  "Missing parts or accessories",
  "Received wrong item",
  "Quality is not as expected",
  "Other reason",
];

const imgUrl   = (p) => { if (!p) return null; if (p.startsWith("http")) return p; return `/uploads/${p.replace(/^uploads\//, "")}`; };
const addDays  = (d, n) => new Date(new Date(d).getTime() + n * 86400000);
const fmtFull  = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"long",  year:"numeric" }) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";
const fmtDay   = (d) => d ? new Date(d).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" }) : "";
const fmtTime  = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }) : "";

function CancelModal({ order, onClose, onConfirm, loading }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState("");
  const [other, setOther] = useState("");
  const reason = selected === "Other reason" ? other : selected;

  return (
    <div className="ord-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ord-modal">
        {step === 1 && (<>
          <div className="ord-modal-header">
            <div className="ord-modal-icon ord-modal-icon--warn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div><h3 className="ord-modal-title">Cancel Order</h3><p className="ord-modal-sub">Order #{order._id?.slice(-8).toUpperCase()}</p></div>
            <button className="ord-modal-close" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <p className="ord-modal-body-text">Please tell us why you want to cancel this order</p>
          <div className="ord-reason-list">
            {CANCEL_REASONS.map((r) => (
              <label key={r} className={`ord-reason-item${selected === r ? " ord-reason-item--selected" : ""}`}>
                <input type="radio" name="cancel-reason" value={r} checked={selected === r} onChange={() => setSelected(r)} className="ord-reason-radio" />
                <span className="ord-reason-custom-radio" /><span className="ord-reason-label">{r}</span>
              </label>
            ))}
          </div>
          {selected === "Other reason" && (
            <textarea className="ord-reason-textarea" placeholder="Please describe your reason..." value={other} onChange={e => setOther(e.target.value)} rows={3} />
          )}
          <div className="ord-modal-footer">
            <button className="ord-modal-btn ord-modal-btn--ghost" onClick={onClose}>Keep Order</button>
            <button className="ord-modal-btn ord-modal-btn--danger" disabled={!selected || (selected === "Other reason" && !other.trim())} onClick={() => setStep(2)}>Continue</button>
          </div>
        </>)}

        {step === 2 && (<>
          <div className="ord-modal-header">
            <div className="ord-modal-icon ord-modal-icon--danger">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </div>
            <div><h3 className="ord-modal-title">Confirm Cancellation</h3><p className="ord-modal-sub">This action cannot be undone</p></div>
            <button className="ord-modal-close" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div className="ord-confirm-box">
            <div className="ord-confirm-row"><span className="ord-confirm-label">Order</span><span className="ord-confirm-val">#{order._id?.slice(-8).toUpperCase()}</span></div>
            <div className="ord-confirm-row"><span className="ord-confirm-label">Items</span><span className="ord-confirm-val">{(order.items || order.products || []).length} item(s)</span></div>
            <div className="ord-confirm-row"><span className="ord-confirm-label">Amount</span><span className="ord-confirm-val">Rs.{Number(order.totalAmount || 0).toLocaleString()}</span></div>
            <div className="ord-confirm-row"><span className="ord-confirm-label">Reason</span><span className="ord-confirm-val ord-confirm-val--reason">{reason}</span></div>
            {order.paymentMethod !== "cod" && (
              <div className="ord-refund-banner"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Refund of Rs.{Number(order.totalAmount || 0).toLocaleString()} will be processed in 5-7 business days</div>
            )}
          </div>
          <div className="ord-modal-footer">
            <button className="ord-modal-btn ord-modal-btn--ghost" onClick={() => setStep(1)}>Back</button>
            <button className="ord-modal-btn ord-modal-btn--danger" disabled={loading} onClick={() => onConfirm(order._id, reason, () => setStep(3))}>{loading ? <span className="ord-modal-spinner" /> : "Yes, Cancel Order"}</button>
          </div>
        </>)}

        {step === 3 && (
          <div className="ord-modal-done">
            <div className="ord-modal-done-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 15 15"/></svg></div>
            <h3>Order Cancellation Requested</h3>
            <p>Your cancellation request has been submitted.</p>
            {order.paymentMethod !== "cod" && <div className="ord-modal-refund-note">Refund will be credited within 5-7 business days</div>}
            <button className="ord-modal-btn ord-modal-btn--primary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReplaceModal({ order, onClose, onConfirm, loading }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState("");
  const [other, setOther] = useState("");
  const reason = selected === "Other reason" ? other : selected;

  return (
    <div className="ord-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ord-modal">
        {step === 1 && (<>
          <div className="ord-modal-header">
            <div className="ord-modal-icon" style={{ color: "#8b5cf6", background: "rgba(139,92,246,0.1)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </div>
            <div><h3 className="ord-modal-title">Return Item</h3><p className="ord-modal-sub">Order #{order._id?.slice(-8).toUpperCase()}</p></div>
            <button className="ord-modal-close" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <p className="ord-modal-body-text">Please select a reason for the return:</p>
          <div className="ord-reason-list">
            {REPLACE_REASONS.map((r) => (
              <label key={r} className={`ord-reason-item${selected === r ? " ord-reason-item--selected" : ""}`}>
                <input type="radio" name="replace-reason" value={r} checked={selected === r} onChange={() => setSelected(r)} className="ord-reason-radio" />
                <span className="ord-reason-custom-radio" /><span className="ord-reason-label">{r}</span>
              </label>
            ))}
          </div>
          {selected === "Other reason" && (
            <textarea className="ord-reason-textarea" placeholder="Please describe the issue..." value={other} onChange={e => setOther(e.target.value)} rows={3} />
          )}
          <div className="ord-modal-footer">
            <button className="ord-modal-btn ord-modal-btn--ghost" onClick={onClose}>Cancel</button>
            <button className="ord-modal-btn ord-modal-btn--primary" style={{ background: "#8b5cf6" }} disabled={!selected || (selected === "Other reason" && !other.trim())} onClick={() => setStep(2)}>Continue</button>
          </div>
        </>)}

        {step === 2 && (<>
          <div className="ord-modal-header">
            <div className="ord-modal-icon" style={{ color: "#8b5cf6", background: "rgba(139,92,246,0.1)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </div>
            <div><h3 className="ord-modal-title">Confirm Request</h3><p className="ord-modal-sub">Review your replacement request</p></div>
            <button className="ord-modal-close" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div className="ord-confirm-box">
            <div className="ord-confirm-row"><span className="ord-confirm-label">Order</span><span className="ord-confirm-val">#{order._id?.slice(-8).toUpperCase()}</span></div>
            <div className="ord-confirm-row"><span className="ord-confirm-label">Items</span><span className="ord-confirm-val">{(order.items || order.products || []).length} item(s)</span></div>
            <div className="ord-confirm-row"><span className="ord-confirm-label">Reason</span><span className="ord-confirm-val ord-confirm-val--reason">{reason}</span></div>
          </div>
          <div className="ord-modal-footer">
            <button className="ord-modal-btn ord-modal-btn--ghost" onClick={() => setStep(1)}>Back</button>
            <button className="ord-modal-btn ord-modal-btn--primary" style={{ background: "#8b5cf6" }} disabled={loading} onClick={() => onConfirm(order._id, reason, () => setStep(3))}>{loading ? <span className="ord-modal-spinner" /> : "Submit Request"}</button>
          </div>
        </>)}

        {step === 3 && (
          <div className="ord-modal-done">
            <div className="ord-modal-done-icon" style={{ color: "#8b5cf6" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 15 15"/></svg></div>
            <h3>Request Submitted</h3>
            <p>Your return request has been received. Our team will contact you shortly.</p>
            <button className="ord-modal-btn ord-modal-btn--primary" style={{ marginTop: 20, background: "#8b5cf6" }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackingBar({ order }) {
  const status = order.status || "Pending";
  
  // Show plain cancelled box only if literally 'Cancelled'
  if (status === "Cancelled" || status === "Abandoned") {
    return (
      <div className="ord-cancelled-box">
        <div className="ord-cancelled-x">X</div>
        <div>
          <div className="ord-cancelled-title">Order {status}</div>
          <div className="ord-cancelled-sub">
            {order.cancelledAt ? `${status} on ${fmtFull(order.cancelledAt)}` : `This order has been ${status.toLowerCase()}`}
            {order.cancelReason && <div style={{ marginTop: 4, color: "#f87171", fontSize: 13 }}>Reason: {order.cancelReason}</div>}
          </div>
        </div>
      </div>
    );
  }

  const isRefund = REFUND_IDX[status] !== undefined;
  const isReplace = REPLACE_IDX[status] !== undefined;
  const currentIdx = isReplace ? REPLACE_IDX[status] : (isRefund ? REFUND_IDX[status] : (STATUS_IDX[status] ?? 0));
  const stepsToUse = isReplace ? REPLACE_STEPS : (isRefund ? REFUND_STEPS : STATUS_STEPS);

  const getStepDate = (step, i) => {
    // For steps we've reached or passed, use actual date if available
    if (i <= currentIdx && order[step.key]) {
      return { date: order[step.key], isEstimate: false };
    }

    // For steps we've reached but no actual date stored, use a sensible fallback
    if (i <= currentIdx) {
      // Find the nearest previous actual date and add the difference in offsets
      for (let j = i - 1; j >= 0; j--) {
        if (order[stepsToUse[j].key]) {
          const diffDays = step.offset - stepsToUse[j].offset;
          return { date: addDays(order[stepsToUse[j].key], Math.max(diffDays, 0)), isEstimate: false };
        }
      }
      return { date: addDays(order.createdAt || new Date(), step.offset), isEstimate: false };
    }

    // For future (not reached) steps, compute forward estimates
    if (isReplace) {
      const baseDate = order.replacementRequestedAt || order.deliveredAt || order.createdAt || new Date();
      return { date: addDays(baseDate, step.offset), isEstimate: true };
    }
    if (isRefund) {
      const baseDate = order.cancelledAt || order.createdAt || new Date();
      return { date: addDays(baseDate, step.offset), isEstimate: true };
    }

    // For normal order future steps: find the last known actual date and estimate forward
    let lastKnownDate = order.createdAt || new Date();
    let lastKnownOffset = 0;
    for (let j = i - 1; j >= 0; j--) {
      if (order[stepsToUse[j].key]) {
        lastKnownDate = order[stepsToUse[j].key];
        lastKnownOffset = stepsToUse[j].offset;
        break;
      }
    }
    // Use expectedDelivery for delivery-related steps if set
    if (step.key === "deliveredAt" && order.expectedDelivery) return { date: order.expectedDelivery, isEstimate: true };
    if (step.key === "outForDeliveryAt" && order.expectedDelivery) return { date: addDays(order.expectedDelivery, -1), isEstimate: true };
    
    const daysDiff = step.offset - lastKnownOffset;
    return { date: addDays(lastKnownDate, Math.max(daysDiff, 1)), isEstimate: true };
  };

  return (
    <div className="ord-timeline">
      {stepsToUse.map((step, i) => {
        const done  = i < currentIdx, active = i === currentIdx, future = i > currentIdx;
        const { date, isEstimate } = getStepDate(step, i);
        return (
          <div key={i} className="ord-tl-col">
            {i > 0 && <div className={`ord-tl-line${done ? " done" : active ? " active" : ""}`} />}
            <div className={`ord-tl-node${done ? " done" : active ? " active" : " future"}`}>
              {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : active ? <span className="ord-tl-pulse" /> : null}
            </div>
            <div className={`ord-tl-info${future ? " future" : ""}`}>
              <div className={`ord-tl-label${active ? " active" : done ? " done" : ""}`}>{step.label}</div>
              <div className="ord-tl-date">
                {future ? <span className="ord-tl-est">Est. {fmtShort(date)}</span>
                        : <><span className="ord-tl-real">{fmtDay(date)}</span>
                            {!isEstimate && <span className="ord-tl-time">{fmtTime(date)}</span>}
                            {isEstimate && active && <span className="ord-tl-time" style={{ color: "#f59e0b" }}>In progress</span>}
                          </>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  let userInfo = null;
  try {
    userInfo = JSON.parse(localStorage.getItem("userInfo") || "null") || JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {}
  const userEmail = userInfo?.email || "";

  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeFilter, setActiveFilter]   = useState("All");
  const [cancelTarget, setCancelTarget]   = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replaceLoading, setReplaceLoading] = useState(false);

  // Enrich order items with product images fetched from API (for old orders without image field)
  const enrichWithImages = async (orderList) => {
    return Promise.all(orderList.map(async (order) => {
      const items = order.items || order.products || [];
      if (items.every(it => it.image)) return order; // all already have images
      const enrichedItems = await Promise.all(items.map(async (item) => {
        if (item.image) return item;
        const pid = item.product?._id || item.product;
        if (!pid) return item;
        try {
          const res = await axios.get(`/api/products/${pid}`);
          const p = res.data;
          return { ...item, image: p.image || p.images?.[0] || "" };
        } catch { return item; }
      }));
      return { ...order, items: enrichedItems };
    }));
  };

  useEffect(() => {
    if (!userInfo) { navigate("/login"); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (userEmail) params.email = userEmail;
      const res  = await axios.get(`/api/orders`, { params });
      const raw  = res.data?.orders ?? res.data;
      let list   = Array.isArray(raw) ? raw : [];
      if (list.length > 0 && userEmail) {
        const mine = list.filter(o => {
          const oEmail = (o.email || o.customerEmail || o.guestEmail || o.user?.email || o.shippingAddress?.email || "").toLowerCase().trim();
          return oEmail === userEmail.toLowerCase().trim();
        });
        if (mine.length > 0) list = mine;
      }
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Enrich items with images from product API for old orders
      const enriched = await enrichWithImages(list);
      setOrders(enriched);
    } catch (err) {
      setError("Could not load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async (orderId, reason, onSuccess) => {
    setCancelLoading(true);
    try {
      // Use PUT /api/orders/:id - same endpoint as admin uses
      await axios.put(`/api/orders/${orderId}`, { 
        status: "Refund Tracking",
        cancelReason: reason,
        cancelledAt: new Date().toISOString()
      });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "Refund Tracking", cancelReason: reason, cancelledAt: new Date().toISOString() } : o));
      onSuccess();
    } catch (err) {
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const FILTERS = ["All","Pending","Processing","Shipped","Out for Delivery","Delivered","Refund Tracking","Replacement Requested"];
  const filteredOrders = activeFilter === "All" ? orders : orders.filter(o => o.status === activeFilter);

  if (loading) return (
    <div className="ord-page">
      <div className="ord-header"><div className="ord-header-left"><button className="ord-back-btn" onClick={() => navigate("/")}>Back</button><h1>My Orders</h1></div></div>
      <div className="ord-skeleton-wrap">{[1,2,3].map(n => (<div key={n} className="ord-skeleton-card"><div className="ord-sk ord-sk-title"/><div className="ord-sk ord-sk-sub"/><div className="ord-sk ord-sk-row"/></div>))}</div>
    </div>
  );

  if (error) return (
    <div className="ord-page">
      <div className="ord-header"><div className="ord-header-left"><button className="ord-back-btn" onClick={() => navigate("/")}>Back</button><h1>My Orders</h1></div></div>
      <div className="ord-empty"><div className="ord-empty-icon">Warning</div><h2>Something went wrong</h2><p>{error}</p><button className="ord-shop-btn" onClick={fetchOrders}>Try Again</button></div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="ord-page">
      <div className="ord-header"><div className="ord-header-left"><button className="ord-back-btn" onClick={() => navigate("/")}>Back</button><h1>My Orders</h1></div><button className="ord-refresh-btn" onClick={fetchOrders}>Refresh</button></div>
      <div className="ord-empty">
        <div className="ord-empty-icon"><svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg></div>
        <h2>No orders yet</h2><p>You have not placed any orders. Start shopping!</p>
        <button className="ord-shop-btn" onClick={() => navigate("/shop")}>Start Shopping</button>
      </div>
    </div>
  );

  return (
    <div className="ord-page">
      {cancelTarget && <CancelModal order={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancelConfirm} loading={cancelLoading} />}
      {replaceTarget && <ReplaceModal order={replaceTarget} onClose={() => setReplaceTarget(null)} onConfirm={async (id, reason, cb) => {
        setReplaceLoading(true);
        try {
          await axios.put(`/api/orders/${id}`, { 
            status: "Replacement Requested",
            cancelReason: reason,
            replacementRequestedAt: new Date().toISOString()
          });
          setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "Replacement Requested", cancelReason: reason, replacementRequestedAt: new Date().toISOString() } : o));
          cb();
        } catch(e) { alert("Failed to process replacement."); } finally { setReplaceLoading(false); }
      }} loading={replaceLoading} />}

      <div className="ord-header">
        <div className="ord-header-left">
          <button className="ord-back-btn" onClick={() => navigate("/")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back
          </button>
          <div><h1>My Orders</h1><p className="ord-count">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p></div>
        </div>
        <button className="ord-refresh-btn" onClick={fetchOrders} title="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>

      <div className="ord-filters">
        {FILTERS.map(f => {
          const cnt = f === "All" ? orders.length : orders.filter(o => o.status === f).length;
          return (
            <button key={f} className={`ord-filter-tab${activeFilter === f ? " ord-filter-tab--active" : ""}`} onClick={() => setActiveFilter(f)}>
              {f}{cnt > 0 && <span className="ord-filter-count">{cnt}</span>}
            </button>
          );
        })}
      </div>

      <div className="ord-list">
        {filteredOrders.length === 0 ? (
          <div className="ord-empty ord-empty--small"><p>No {activeFilter.toLowerCase()} orders found.</p></div>
        ) : filteredOrders.map(order => {
          const orderId = order._id, status = order.status || "Pending", isExpanded = expandedOrder === orderId;
          const products = order.items || order.products || [];
          const address  = order.address || order.shippingAddress || {};
          const shortId  = orderId?.slice(-8).toUpperCase();
          const col      = STATUS_COLORS[status] || STATUS_COLORS.Pending;
          
          const actualMethod = (order.paymentInfo?.method || order.paymentMethod || "cod").toLowerCase();
          const isPaid   = actualMethod !== "cod" || (order.paymentInfo?.status === "Paid");
          const deliveryDate = order.expectedDelivery ? new Date(order.expectedDelivery) : addDays(order.createdAt, 5);
          
          // Determine friendly payment method string
          const rawMethod = order.paymentMethod || "";
          let methodLabel = PAYMENT_LABELS[rawMethod.toLowerCase()] || rawMethod || "Cash on Delivery";
          if (order.paymentInfo?.method) {
            const m = order.paymentInfo.method.toLowerCase();
            const details = order.paymentInfo.methodDetails || {};
            if (m === 'card' && details.card?.network) methodLabel = `${details.card.network} Card (**** ${details.card.last4})`;
            else if (m === 'upi' && details.vpa) methodLabel = `UPI (GPay/PhonePe: ${details.vpa})`;
            else methodLabel = PAYMENT_LABELS[m] || order.paymentInfo.method;
          }

          return (
            <div key={orderId} className={`ord-card${isExpanded ? " ord-card--expanded" : ""}`}>
              <div className="ord-card-header" onClick={() => setExpandedOrder(isExpanded ? null : orderId)}>
                <div className="ord-card-header-left">
                  <div className="ord-id-row">
                    <span className="ord-id">Order #{shortId}</span>
                    <span className="ord-status-badge" style={{ color: col.color, background: col.bg }}>{status}</span>
                    <span className={`ord-pay-pill${isPaid ? " paid" : " cod"}`}>{isPaid ? "Paid" : "COD"}</span>
                  </div>
                  <div className="ord-meta-row">
                    <span>{fmtFull(order.createdAt)}</span><span className="ord-meta-sep">.</span>
                    <span>{fmtTime(order.createdAt)}</span><span className="ord-meta-sep">.</span>
                    <span>{products.length} item{products.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                  <div className="ord-card-header-right">
                    <div className="ord-total">Rs.{Number(order.totalAmount || 0).toLocaleString()}</div>
                    <div className="ord-payment-label">{methodLabel}</div>
                    <div className={`ord-chevron${isExpanded ? " ord-chevron--up" : ""}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
                  </div>
              </div>

              <div className="ord-thumb-strip">
                <div className="ord-thumbs">
                  {products.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="ord-thumb">
                      {item.image ? <img src={imgUrl(item.image)} alt={item.name} onError={e => { e.target.style.display = "none"; }} />
                                  : <div className="ord-thumb-ph">{(item.name || "P").charAt(0)}</div>}
                    </div>
                  ))}
                  {products.length > 5 && <div className="ord-thumb ord-thumb-more">+{products.length - 5}</div>}
                </div>
                {status !== "Cancelled" && status !== "Refund Tracking" && (
                  <div className={`ord-eta${status === "Delivered" ? " ord-eta--done" : ""}`}>
                    {status === "Delivered" ? <>Delivered on {fmtShort(order.deliveredAt || deliveryDate)}</>
                      : <>Delivery by <strong>{fmtShort(deliveryDate)}</strong></>}
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="ord-details">
                  <div className="ord-section">
                    <div className="ord-section-title">Order Tracking</div>
                    <TrackingBar order={order} />
                    {order.trackingId && <div className="ord-tracking-id">Tracking ID: <strong>{order.trackingId}</strong>{order.courier && <> . {order.courier}</>}</div>}
                  </div>

                  <div className="ord-section">
                    <div className="ord-section-title">Items ({products.length})</div>
                    <div className="ord-items">
                      {products.map((item, idx) => {
                        const qty = item.qty || item.quantity || 1;
                        return (
                          <div key={idx} className="ord-item">
                            <div className="ord-item-img">
                              {item.image ? <img src={imgUrl(item.image)} alt={item.name} onError={e => { e.target.style.display = "none"; }} />
                                          : <div className="ord-item-ph-lg">{(item.name || "P").charAt(0)}</div>}
                            </div>
                            <div className="ord-item-info">
                              <div className="ord-item-name">{item.name || "Product"}</div>
                              <div className="ord-item-sub"><span>Qty: {qty}</span><span>.</span><span>Rs.{Number(item.price || 0).toLocaleString()} each</span></div>
                            </div>
                            <div className="ord-item-price">Rs.{(qty * Number(item.price || 0)).toLocaleString()}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="ord-info-grid">
                    <div className="ord-info-card">
                      <div className="ord-info-card-title">Delivery Address</div>
                      <div className="ord-info-card-body">
                        <p className="ord-addr-name">{order.customerName || address.name || address.firstName}</p>
                        {(address.street || address.address) && <p>{address.street || address.address}</p>}
                        {(address.city || address.state) && <p>{[address.city, address.state, address.zip || address.pincode].filter(Boolean).join(", ")}</p>}
                        {(order.mobile || address.phone) && <p className="ord-addr-mobile">{order.mobile || address.phone}</p>}
                      </div>
                    </div>
                    <div className="ord-info-card">
                      <div className="ord-info-card-title">Payment Info</div>
                      <div className="ord-info-card-body">
                        <p><strong>{methodLabel}</strong></p>
                        {order.paymentInfo?.id && <p className="text-[10px] text-gray-400 mt-1">ID: {order.paymentInfo.id}</p>}
                        <p style={{ marginTop: 6, fontWeight: 600, color: isPaid ? "#22c55e" : "#f59e0b" }}>{isPaid ? "Payment Received" : "Pay on Delivery"}</p>
                      </div>
                    </div>
                    <div className="ord-info-card">
                      <div className="ord-info-card-title">Price Breakdown</div>
                      <div className="ord-price-breakdown">
                        <div className="ord-pb-row"><span>Items Total</span><span>Rs.{Number(order.totalAmount || 0).toLocaleString()}</span></div>
                        <div className="ord-pb-row"><span>Delivery</span><span style={{ color: "#22c55e", fontWeight: 600 }}>FREE</span></div>
                        <div className="ord-pb-row ord-pb-total"><span>Total</span><span className="ord-pb-amt">Rs.{Number(order.totalAmount || 0).toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="ord-actions">
                    <button className="ord-action-btn ord-action-btn--ghost" onClick={() => navigate("/shop")}>Continue Shopping</button>
                    {status === "Delivered" && (
                      <div className="flex gap-2">
                        <button className="ord-action-btn ord-action-btn--primary flex-1" onClick={(e) => { 
                          e.stopPropagation(); 
                          localStorage.setItem('exchangeContext', JSON.stringify({ oldOrderId: order._id, oldTotal: order.totalAmount }));
                          navigate("/shop");
                        }}>Replace Item</button>
                        <button className="ord-action-btn ord-action-btn--ghost flex-1" onClick={(e) => { e.stopPropagation(); setReplaceTarget(order); }}>Return Item</button>
                      </div>
                    )}
                    {status !== "Cancelled" && status !== "Refund Tracking" && status !== "Delivered" && !status.includes("Replacement") && (
                      <button className="ord-action-btn ord-action-btn--danger" onClick={(e) => { e.stopPropagation(); setCancelTarget(order); }}>Cancel Order</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
