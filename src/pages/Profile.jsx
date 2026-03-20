import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { User, Phone, Building, Mail, Lock, Camera, Save, ArrowLeft, Check, X, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FeedbackModal from "../components/FeedbackModal";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: 'success', message: '' });
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    companyAddress: "",
    gstNumber: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const storedUser = localStorage.getItem("userInfo");
  const loggedUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/${loggedUser._id}/profile`);
        setUser(res.data);
        setFormData(prev => ({
          ...prev,
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          company: res.data.company || "",
          companyAddress: res.data.companyAddress || "",
          gstNumber: res.data.gstNumber || "",
          avatar: res.data.avatar || "",
        }));
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Strict numeric-only for phone
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 15);
    }

    // Real-time email character filtering
    if (name === 'email') {
      value = value.replace(/[^a-zA-Z0-9@._-]/g, '');
    }
    
    // Auto-uppercase for GST
    if (name === 'gstNumber') {
      value = value.toUpperCase().slice(0, 15);
    }

    setFormData({ ...formData, [name]: value });
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-100' };
    let score = 0;
    if (pwd.length > 7) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const levels = [
      { label: 'Too Weak', color: 'bg-red-400', width: '25%' },
      { label: 'Weak', color: 'bg-orange-400', width: '50%' },
      { label: 'Fair', color: 'bg-yellow-400', width: '75%' },
      { label: 'Strong', color: 'bg-green-500', width: '100%' }
    ];
    return levels[score - 1] || levels[0];
  };

  const strength = getPasswordStrength(formData.newPassword);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileData = new FormData();
    fileData.append("avatar", file);

    try {
      setSaving(true);
      const res = await axios.post(`/api/users/${loggedUser._id}/upload-avatar`, fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, avatar: res.data.avatar }));
      setFeedback({ show: true, type: 'success', message: 'Profile photo updated successfully!' });
    } catch (err) {
      setFeedback({ show: true, type: 'error', message: err.response?.data?.message || 'Failed to upload image.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!emailRegex.test(formData.email)) {
      return setFeedback({ show: true, type: 'error', message: 'Please enter a valid email address.' });
    }
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      return setFeedback({ show: true, type: 'error', message: 'Phone number must be 10-15 digits.' });
    }
    if (user?.role === 'dealer' && formData.gstNumber && !gstRegex.test(formData.gstNumber)) {
        return setFeedback({ show: true, type: 'error', message: 'Please enter a valid 15-character GST number (e.g., 22AAAAA0000A1Z5).' });
    }

    if (!formData.currentPassword) {
      return setFeedback({ show: true, type: 'error', message: 'Current password is required to save changes.' });
    }
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return setFeedback({ show: true, type: 'error', message: 'New passwords do not match.' });
    }

    setSaving(true);
    try {
      const { confirmPassword, newPassword, ...submitData } = formData;
      if (newPassword) submitData.password = newPassword;

      const res = await axios.put(`/api/users/${loggedUser._id}/profile`, submitData);
      
      const updatedLocal = { ...loggedUser, name: res.data.name };
      localStorage.setItem("userInfo", JSON.stringify(updatedLocal));
      
      setUser(res.data);
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      setFeedback({ show: true, type: 'success', message: 'Your account has been updated successfully.' });
    } catch (err) {
      setFeedback({ show: true, type: 'error', message: err.response?.data?.message || 'Update failed. Check your current password.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto px-6 py-10 mt-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        <Link to="/" className="text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <div className="space-y-10">
        <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => fileInputRef.current.click()}
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-gray-200" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-2xl">
              <Camera className="text-white" size={20} />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 leading-tight">{formData.name || user.name}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{user.role} Account</p>
            <button 
              onClick={() => fileInputRef.current.click()}
              className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-2 hover:underline"
            >
              Update Image
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold" placeholder="10-15 digits only" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">{user?.role === 'dealer' ? 'Company Name' : 'Company'}</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold" />
            </div>
            {user?.role === 'dealer' && (
              <>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Company Address</label>
                  <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold" placeholder="Detailed address..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">GST Number (Optional)</label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold" placeholder="GSTIN..." />
                </div>
              </>
            )}
          </div>

          <div className="pt-4 space-y-5 border-t border-gray-50">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600 ml-0.5">Enter Current Password to Save</label>
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full h-11 px-4 bg-blue-50/50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all text-sm font-semibold placeholder:text-blue-200" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">New Password (Optional)</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold" placeholder="••••••••" />
                {formData.newPassword && (
                    <div className="mt-2 space-y-1">
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }}></div>
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 text-right">{strength.label}</p>
                    </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Confirm New</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full h-12 bg-[#1e293b] text-white rounded-xl font-bold uppercase tracking-[0.15em] text-[11px] hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
          >
            {saving ? "Saving..." : <><Save size={14} /> Update Account</>}
          </button>
        </form>
      </div>

      <FeedbackModal 
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ ...feedback, show: false })}
      />
    </div>
  );
}
