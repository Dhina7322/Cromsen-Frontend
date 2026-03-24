import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save, Shield, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "/api";
const adminHeaders = { headers: { 'x-user-role': 'admin' } };

export default function PolicyTab() {
  const { showToast } = useOutletContext();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "", isActive: true });

  useEffect(() => { fetchPolicies(); }, []);

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${API}/policies`, adminHeaders);
      setPolicies(res.data);
    } catch (err) { console.error(err); }
  };

  const handleOpenModal = (policy = null) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({ title: policy.title, content: policy.content, isActive: policy.isActive });
    } else {
      setEditingPolicy(null);
      setFormData({ title: "", content: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPolicy) {
        await axios.put(`${API}/policies/${editingPolicy._id}`, formData, adminHeaders);
        showToast("success", "Policy updated");
      } else {
        await axios.post(`${API}/policies`, formData, adminHeaders);
        showToast("success", "Policy created");
      }
      setIsModalOpen(false);
      fetchPolicies();
    } catch (err) {
      showToast("error", "Failed to save policy");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this policy?")) return;
    try {
      await axios.delete(`${API}/policies/${id}`, adminHeaders);
      showToast("success", "Policy deleted");
      fetchPolicies();
    } catch { showToast("error", "Failed to delete policy"); }
  };

  return (
    <div className="section-gap">
      <div className="toolbar">
        <div className="toolbar-left">
          <h2 className="text-xl font-bold text-gray-800">Policies & Legal</h2>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map(p => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Shield size={20} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(p)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-red-50 rounded-full text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{p.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{p.content.replace(/<[^>]*>/g, '')}</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {p.isActive ? 'Active' : 'Draft'}
              </span>
            </div>
          </motion.div>
        ))}

        {policies.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Shield size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-gray-500 font-bold">No policies found</h3>
            <p className="text-sm text-gray-400 mt-1">Create policies for your footer like Shipping, Returns, Privacy etc.</p>
          </div>
        )}
      </div>

      {/* Policy Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal"
              style={{ maxWidth: 700 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-head">
                <h2>{editingPolicy ? 'Edit Policy' : 'New Policy'}</h2>
                <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body space-y-6">
                  <div className="fg">
                    <label>Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Privacy Policy, Shipping Info"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="fg">
                    <label>Content (Full Text)</label>
                    <textarea
                      required
                      rows="12"
                      placeholder="Paste your policy text here..."
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="policyActive"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="policyActive" className="text-sm font-bold text-gray-700">Display in Footer (Public)</label>
                  </div>
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    <Save size={16} /> {loading ? 'Saving...' : 'Save Policy'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
