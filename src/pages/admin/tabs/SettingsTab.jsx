import React, { useState } from "react";
import { 
  Settings, 
  Key, 
  User, 
  Save, 
  Shield, 
  RefreshCw,
  Bell,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "/api";

export default function SettingsTab() {
  const { user, showToast } = useOutletContext();
  const [loading, setLoading] = useState(false);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    currentUsername: user.name,
    newUsername: user.name
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (profileForm.newUsername === user.name) return;
    setLoading(true);
    try {
      const res = await axios.put(`${API}/admin/change-username`, {
        currentUsername: user.name,
        newUsername: profileForm.newUsername
      });
      showToast("success", "Username updated! Please login again for full sync.");
      sessionStorage.setItem("cromsen_user", res.data.username);
      // We don't force logout for better UX, but update local state if possible
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showToast("error", "Passwords do not match");
    }
    setLoading(true);
    try {
      await axios.put(`${API}/admin/change-password`, {
        username: user.name,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showToast("success", "Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-gap">
      <div className="toolbar">
        <div>
          <h3 className="tab-title">Account Settings</h3>
          <p className="tab-desc">Manage your administrative profile and security preferences.</p>
        </div>
      </div>

      <div className="dash-grid-2">
        {/* Profile Settings */}
        <div className="dash-card">
          <div className="dash-card-head">
            <h3 className="dash-card-title flex items-center gap-2">
              <User size={18} className="text-orange-500"/> Profile Information
            </h3>
          </div>
          <form onSubmit={handleUpdateUsername} className="p-6">
            <div className="fg">
              <label>Current Username</label>
              <input type="text" value={user.name} disabled className="bg-gray-100" />
            </div>
            <div className="fg">
              <label>New Username</label>
              <input 
                required 
                type="text" 
                value={profileForm.newUsername} 
                onChange={e => setProfileForm({...profileForm, newUsername: e.target.value})} 
                placeholder="Enter new username"
              />
            </div>
            <div className="alert-box mb-4">
              <RefreshCw size={14} />
              <p>Changing your username will require a session refresh.</p>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading || profileForm.newUsername === user.name}>
              <Save size={16} /> Save Changes
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="dash-card">
          <div className="dash-card-head">
            <h3 className="dash-card-title flex items-center gap-2">
              <Key size={18} className="text-orange-500"/> Security & Password
            </h3>
          </div>
          <form onSubmit={handleUpdatePassword} className="p-6">
            <div className="fg">
              <label>Current Password</label>
              <input 
                required 
                type="password" 
                value={passwordForm.currentPassword} 
                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                placeholder="••••••••"
              />
            </div>
            <div className="form-r2">
              <div className="fg">
                <label>New Password</label>
                <input 
                  required 
                  type="password" 
                  value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                  placeholder="••••••••"
                />
              </div>
              <div className="fg">
                <label>Confirm New Password</label>
                <input 
                  required 
                  type="password" 
                  value={passwordForm.confirmPassword} 
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <Shield size={16} /> Update Security
            </button>
          </form>
        </div>
      </div>

      <div className="dash-grid-1 mt-6">
        <div className="dash-card">
          <div className="dash-card-head">
            <h3 className="dash-card-title flex items-center gap-2">
              <Settings size={18} className="text-orange-500"/> System Preferences
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="setting-box">
              <Bell size={24} className="text-orange-400 mb-2"/>
              <strong>Notifications</strong>
              <p className="text-xs text-gray-500">Manage email alerts for new orders & low stock.</p>
              <span className="badge-pill mt-2">Active</span>
            </div>
            <div className="setting-box">
              <Globe size={24} className="text-orange-400 mb-2"/>
              <strong>SEO & Metadata</strong>
              <p className="text-xs text-gray-500">Configure site title, description and keywords.</p>
              <button className="text-orange-600 text-xs font-bold mt-2 hover:underline">Edit SEO</button>
            </div>
            <div className="setting-box">
               <Shield size={24} className="text-orange-400 mb-2"/>
               <strong>API Access</strong>
               <p className="text-xs text-gray-500">Manage external tokens for third-party integrations.</p>
               <button className="text-orange-600 text-xs font-bold mt-2 hover:underline">Manage Keys</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
