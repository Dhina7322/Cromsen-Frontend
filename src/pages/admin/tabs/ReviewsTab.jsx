import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Trash2, MessageCircle, Star, Search, Filter, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "/api";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/reviews/admin/all`, {
        headers: { 'x-user-role': 'admin' }
      });
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/reviews/admin/${id}/status`, { status }, {
        headers: { 'x-user-role': 'admin' }
      });
      setReviews(reviews.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      console.error("Error updating review status:", err);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`${API}/reviews/admin/${id}`, {
        headers: { 'x-user-role': 'admin' }
      });
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && r.status === filterStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="section-gap">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="searchbox">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search reviews, products, users..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>User</th>
              <th>Product</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredReviews.length > 0 ? filteredReviews.map((review) => (
                <motion.tr 
                  key={review._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td>
                    <div className="font-bold text-gray-900">{review.userName}</div>
                  </td>
                  <td>
                    <div className="text-gray-600 text-xs font-semibold">{review.product?.name || "Deleted Product"}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-orange">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div className="text-gray-600 text-xs italic line-clamp-2" title={review.comment}>"{review.comment}"</div>
                  </td>
                  <td>
                    <span className={`status-tag ${
                      review.status === 'approved' ? 's-delivered' : 
                      review.status === 'rejected' ? 's-cancelled' : 's-pending'
                    }`}>
                      <i className={
                        review.status === 'approved' ? 'bg-green' : 
                        review.status === 'rejected' ? 'bg-red' : 'bg-orange'
                      } />
                      {review.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="text-gray-400 text-[10px] font-bold">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="panel-actions">
                      {review.status !== 'approved' && (
                        <button 
                          onClick={() => updateStatus(review._id, 'approved')}
                          className="p-1.5 bg-green-light text-green rounded-lg hover:bg-green hover:text-white transition-all"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {review.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(review._id, 'rejected')}
                          className="p-1.5 bg-orange-light text-orange rounded-lg hover:bg-orange hover:text-white transition-all"
                          title="Reject"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteReview(review._id)}
                        className="p-1.5 bg-red-light text-red rounded-lg hover:bg-red hover:text-white transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    No reviews found matching filters.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
