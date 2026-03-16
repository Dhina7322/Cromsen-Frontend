import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Plus, 
  Trash2, 
  UserPlus, 
  X,
  Save,
  ShieldCheck,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const API = "/api";

export default function AdminsTab() {
  const { user: currentUser, showToast } = useOutletContext();
  const [subAdmins, setSubAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ username: "", password: "" });

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      const res = await axios.get(`${API}/admin/subadmins`);
      setSubAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/admin/subadmins`, formData);
      showToast("success", "Sub-admin created successfully");
      setIsModalOpen(false);
      setFormData({ username: "", password: "" });
      fetchSubAdmins();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to create sub-admin");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove administrative access for this user?")) return;
    try {
      await axios.delete(`${API}/admin/subadmins/${id}`);
      showToast("success", "Admin removed");
      fetchSubAdmins();
    } catch (err) {
      showToast("error", "Failed to delete");
    }
  };

  return (
    <div className="section-gap">
      <div className="toolbar">
        <div>
           <h3 className="tab-title">Administrator Management</h3>
           <p className="tab-desc">Grant or revoke access to the admin panel dashboard.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} /> New Sub-Admin
        </button>
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
           <div className="dash-card-head"><h3 className="dash-card-title">Active Administrators</h3></div>
           <div className="tbl-wrap" style={{ border: 'none' }}>
             <table className="tbl">
               <thead>
                 <tr>
                   <th>Username</th>
                   <th>Role</th>
                   <th style={{ textAlign: 'right' }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                  <tr>
                    <td>
                      <div className="cust-cell">
                        <div className="sb-avatar" style={{ background: 'var(--orange)' }}><Shield size={14}/></div>
                        <span className="cust-name" style={{ marginLeft: '10px' }}>{currentUser.name} (You)</span>
                      </div>
                    </td>
                    <td><span className="p-role p-role--main">Super Admin</span></td>
                    <td style={{ textAlign: 'right' }}>
                       <span className="text-gray-400 text-xs italic">Protected</span>
                    </td>
                  </tr>
                  {subAdmins.map(admin => (
                    <tr key={admin._id}>
                      <td>
                        <div className="cust-cell">
                          <div className="sb-avatar"><ShieldCheck size={14}/></div>
                          <span className="cust-name" style={{ marginLeft: '10px' }}>{admin.username}</span>
                        </div>
                      </td>
                      <td><span className="p-role p-role--sub">Sub Admin</span></td>
                      <td style={{ textAlign: 'right' }}>
                         <button className="icon-btn danger" onClick={() => handleDelete(admin._id)}><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>

        <div className="dash-card">
           <div className="dash-card-head"><h3 className="dash-card-title">Admin Perks</h3></div>
           <div className="p-6 space-y-4">
              <div className="perk-item">
                 <div className="perk-icon"><Shield size={16}/></div>
                 <div className="perk-info">
                    <strong>Manage All Records</strong>
                    <p>Sub-admins can add, edit, and delete products, categories and orders.</p>
                 </div>
              </div>
              <div className="perk-item">
                 <div className="perk-icon"><Key size={16}/></div>
                 <div className="perk-info">
                    <strong>Dashboard Access</strong>
                    <p>Access to real-time sales and inventory statistics.</p>
                 </div>
              </div>
              <div className="alert-box">
                <Shield size={16} className="text-orange-600" />
                <p>Only the Super Admin can manage other administrator accounts.</p>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal modal--sm">
              <div className="modal-head">
                 <h2>Create Sub-Admin</h2>
                 <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={18}/></button>
              </div>
              <form onSubmit={handleCreate}>
                 <div className="modal-body">
                    <div className="fg">
                       <label>Username</label>
                       <input required type="text" placeholder="e.g. manager_1" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div className="fg">
                       <label>Password</label>
                       <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">New admins will have full access to manage store data but cannot manage other admins.</p>
                 </div>
                 <div className="modal-foot">
                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                       <UserPlus size={16} /> {loading ? 'Creating...' : 'Create Admin Account'}
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
