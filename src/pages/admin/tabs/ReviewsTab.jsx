import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Trash2, MessageCircle, Star, Search, Filter, Clock, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../../utils/imageUtils";

const API = import.meta.env.VITE_API_URL || "/api";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  useEffect(() => {
    if (selectedReview) {
      setAdminReply(selectedReview.adminReply || "");
    }
  }, [selectedReview]);

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
      if (selectedReview && selectedReview._id === id) {
        setSelectedReview({ ...selectedReview, status });
      }
    } catch (err) {
      console.error("Error updating review status:", err);
    }
  };

  const saveReply = async () => {
    if (!selectedReview) return;
    try {
      setSavingReply(true);
      await axios.put(`${API}/reviews/admin/${selectedReview._id}/status`, { adminReply }, {
        headers: { 'x-user-role': 'admin' }
      });
      setReviews(reviews.map(r => r._id === selectedReview._id ? { ...r, adminReply } : r));
      setSelectedReview({ ...selectedReview, adminReply });
      alert("Reply saved successfully!");
    } catch (err) {
      console.error("Error saving reply:", err);
    } finally {
      setSavingReply(false);
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
              <th>Media</th>
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
                    <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[100px]">
                      {review.images?.map((img, i) => (
                        <img key={i} src={getImageUrl(img)} className="w-8 h-8 object-cover rounded border border-gray-100 cursor-pointer" onClick={() => window.open(getImageUrl(img), '_blank')} />
                      ))}
                      {review.videos?.map((vid, i) => (
                        <div key={i} className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400" title="Video"><Search size={10}/></div>
                      ))}
                    </div>
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
                      <button 
                        onClick={() => setSelectedReview(review)}
                        className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
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
      
      <AnimatePresence>
        {selectedReview && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Review Details</h3>
                <button 
                  onClick={() => setSelectedReview(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-1">User Name</span>
                    <span className="font-bold text-gray-900">{selectedReview.userName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-1">Product</span>
                    <span className="font-bold text-gray-900">{selectedReview.product?.name || "Deleted Product"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-1">Date Submitted</span>
                    <span className="font-bold text-gray-900">{new Date(selectedReview.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-1">Rating</span>
                    <div className="flex items-center gap-1 text-orange">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} fill={s <= selectedReview.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-2">Comment</span>
                  <div className="p-4 bg-gray-50 rounded-xl text-gray-700 text-sm leading-relaxed border border-gray-100 whitespace-pre-wrap">
                    "{selectedReview.comment}"
                  </div>
                </div>

                {(selectedReview.images?.length > 0 || selectedReview.videos?.length > 0) && (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-2">Media</span>
                    <div className="flex flex-wrap gap-3">
                      {selectedReview.images?.map((img, i) => (
                        <img 
                          key={i} 
                          src={getImageUrl(img)} 
                          className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
                          onClick={() => window.open(getImageUrl(img), '_blank')}
                        />
                      ))}
                      {selectedReview.videos?.map((vid, i) => (
                        <video 
                          key={i} 
                          src={getImageUrl(vid)} 
                          className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                          controls
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedReview.status === 'approved' && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <span className="text-[10px] uppercase tracking-widest font-black text-action block mb-2">Admin Reply</span>
                    <textarea 
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="Write your response to the customer here..."
                      className="w-full h-24 p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-action resize-none font-medium text-gray-700"
                    />
                    <div className="flex justify-end mt-2">
                       <button 
                        onClick={saveReply}
                        disabled={savingReply}
                        className="px-4 py-2 bg-action text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                       >
                         {savingReply ? 'Saving...' : 'Save Reply'}
                       </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 flex-shrink-0">
                {selectedReview.status !== 'rejected' ? (
                  <button 
                    onClick={() => updateStatus(selectedReview._id, 'rejected')}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-all flex items-center gap-2"
                  >
                    <X size={16} /> Reject
                  </button>
                ) : (
                  <div className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-400 flex items-center gap-2 cursor-not-allowed">
                    <X size={16} /> Rejected
                  </div>
                )}
                {selectedReview.status !== 'approved' ? (
                  <button 
                    onClick={() => updateStatus(selectedReview._id, 'approved')}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2"
                  >
                    <Check size={16} /> Approve
                  </button>
                ) : (
                  <div className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-400 flex items-center gap-2 cursor-not-allowed">
                    <Check size={16} /> Approved
                  </div>
                )}
                <button 
                  onClick={() => setSelectedReview(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
