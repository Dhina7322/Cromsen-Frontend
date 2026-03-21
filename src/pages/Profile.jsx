import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { User, Phone, Mail, Lock, Camera, Save, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FeedbackModal from "../components/FeedbackModal";

// ─── Strict email: TLD max 6 chars, nothing allowed after it ─────────────────
const isValidEmail = (v) => {
  if (!v) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/.test(v);
};
const phoneRegex = /^[0-9]{10,15}$/;
const gstRegex   = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const EMAIL_DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','protonmail.com','ymail.com'];

// ─── EmailInput ───────────────────────────────────────────────────────────────
function EmailInput({ value, onChange, required, inputClassName = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const valid   = isValidEmail(value);
  const invalid = value && !valid;

  const atIdx   = value?.indexOf('@') ?? -1;
  const local   = atIdx >= 0 ? value.slice(0, atIdx) : value;
  const afterAt = atIdx >= 0 ? value.slice(atIdx + 1) : '';
  const suggestions = atIdx >= 0
    ? EMAIL_DOMAINS.filter(d => d.startsWith(afterAt) && `${local}@${d}` !== value).map(d => `${local}@${d}`)
    : [];

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const pick = (val) => { onChange({ target: { name: 'email', value: val } }); setOpen(false); };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\s/g, '');
    // Block typing once email is already valid (prevents .comweweq)
    if (raw.length > (value?.length || 0) && isValidEmail(value)) return;
    onChange({ target: { name: 'email', value: raw } });
    setOpen(true);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input
          required={required}
          type="text"
          name="email"
          value={value}
          autoComplete="off"
          spellCheck={false}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          className={`${inputClassName} pr-10 ${
            value
              ? valid
                ? 'ring-1 ring-green-500/30 focus:ring-green-500/40'
                : 'ring-1 ring-red-400/40 focus:ring-red-400/50'
              : ''
          }`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {valid
              ? <Check size={14} className="text-green-500" />
              : <AlertCircle size={14} className="text-red-400" />}
          </div>
        )}
      </div>
      {invalid && (
        <p className="text-[10px] text-red-400 mt-1 font-medium">
          {value.includes('@')
            ? 'Nothing allowed after .com / .in — check your email'
            : 'Enter a valid email — e.g. name@gmail.com'}
        </p>
      )}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 right-0 z-50 bg-white border border-gray-100 rounded-xl shadow-2xl mt-1 py-1 overflow-hidden"
            style={{ zIndex: 9999 }}
          >
            {suggestions.map(s => (
              <li
                key={s}
                onMouseDown={() => pick(s)}
                className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <span className="text-gray-400">{local}</span>
                <span className="font-bold text-blue-600">@{s.split('@')[1]}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PhoneInput ───────────────────────────────────────────────────────────────
function PhoneInput({ value, onChange, inputClassName = '' }) {
  const isValid   = value && phoneRegex.test(value);
  const isInvalid = value && !phoneRegex.test(value);

  return (
    <div>
      <div className="relative">
        <input
          type="tel"
          name="phone"
          value={value}
          placeholder="10–15 digits only"
          onChange={e => onChange({ target: { name: 'phone', value: e.target.value.replace(/[^0-9]/g, '').slice(0, 15) } })}
          className={`${inputClassName} pr-10 ${
            value
              ? isValid
                ? 'ring-1 ring-green-500/30 focus:ring-green-500/40'
                : 'ring-1 ring-red-400/40 focus:ring-red-400/50'
              : ''
          }`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid
              ? <Check size={14} className="text-green-500" />
              : <AlertCircle size={14} className="text-red-400" />}
          </div>
        )}
      </div>
      {isInvalid && (
        <p className="text-[10px] text-red-400 mt-1 font-medium">Must be 10–15 digits, numbers only</p>
      )}
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function Profile() {
  const navigate    = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: 'success', message: '' });
  const [user, setUser]         = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', companyAddress: '',
    gstNumber: '', avatar: '', currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const storedUser = localStorage.getItem('userInfo');
  const loggedUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!loggedUser) { navigate('/login'); return; }
    (async () => {
      try {
        const res = await axios.get(`/api/users/${loggedUser._id}/profile`);
        setUser(res.data);
        setFormData(p => ({ ...p, name: res.data.name||'', email: res.data.email||'', phone: res.data.phone||'', company: res.data.company||'', companyAddress: res.data.companyAddress||'', gstNumber: res.data.gstNumber||'', avatar: res.data.avatar||'' }));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-100', width: '0%' };
    let score = 0;
    if (pwd.length > 7)           score++;
    if (/[A-Z]/.test(pwd))        score++;
    if (/[0-9]/.test(pwd))        score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: 'Too Weak', color: 'bg-red-400',    width: '25%' },
      { label: 'Weak',     color: 'bg-orange-400', width: '50%' },
      { label: 'Fair',     color: 'bg-yellow-400', width: '75%' },
      { label: 'Strong',   color: 'bg-green-500',  width: '100%' },
    ];
    return levels[score - 1] || levels[0];
  };

  const strength = getPasswordStrength(formData.newPassword);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('avatar', file);
    try {
      setSaving(true);
      const res = await axios.post(`/api/users/${loggedUser._id}/upload-avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(p => ({ ...p, avatar: res.data.avatar }));
      // Update localStorage so navbar reflects change immediately
      const updatedUser = { ...loggedUser, avatar: res.data.avatar };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setFeedback({ show: true, type: 'success', message: 'Profile photo updated!' });
    } catch (err) {
      setFeedback({ show: true, type: 'error', message: err.response?.data?.message || 'Upload failed.' });
    } finally { setSaving(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(formData.email))
      return setFeedback({ show: true, type: 'error', message: 'Please enter a valid email address.' });
    if (formData.phone && !phoneRegex.test(formData.phone))
      return setFeedback({ show: true, type: 'error', message: 'Phone number must be 10–15 digits.' });
    if (formData.gstNumber && !gstRegex.test(formData.gstNumber))
      return setFeedback({ show: true, type: 'error', message: 'Enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z5).' });
    if (!formData.currentPassword)
      return setFeedback({ show: true, type: 'error', message: 'Current password is required to save changes.' });
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword)
      return setFeedback({ show: true, type: 'error', message: 'New passwords do not match.' });

    setSaving(true);
    try {
      const { confirmPassword, newPassword, ...submitData } = formData;
      if (newPassword) submitData.password = newPassword;
      const res = await axios.put(`/api/users/${loggedUser._id}/profile`, submitData);
      localStorage.setItem('userInfo', JSON.stringify({ ...loggedUser, name: res.data.name, avatar: res.data.avatar }));
      setUser(res.data);
      setFormData(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setFeedback({ show: true, type: 'success', message: 'Account updated successfully.' });
    } catch (err) {
      setFeedback({ show: true, type: 'error', message: err.response?.data?.message || 'Update failed. Check your current password.' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">Loading...</div>;

  const baseInput = "w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold";

  return (
    <div className="max-w-xl mx-auto px-6 py-10 mt-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        <Link to="/" className="text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <div className="space-y-10">
        {/* Avatar */}
        <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner">
              {formData.avatar ? <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-gray-200" />}
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-2xl"><Camera className="text-white" size={20} /></div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 leading-tight">{formData.name || user.name}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{user.role} Account</p>
            <button onClick={() => fileInputRef.current.click()} className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-2 hover:underline">Update Image</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={baseInput} required />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Email</label>
              <EmailInput value={formData.email} onChange={handleChange} required inputClassName={baseInput} />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Phone</label>
              <PhoneInput value={formData.phone} onChange={handleChange} inputClassName={baseInput} />
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">{user?.role === 'dealer' ? 'Company Name' : 'Company'}</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} className={baseInput} />
            </div>

            {user?.role === 'dealer' && (
              <>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Company Address</label>
                  <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} className={baseInput} placeholder="Detailed address..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">GST Number (Optional)</label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={e => handleChange({ target: { name: 'gstNumber', value: e.target.value.toUpperCase().slice(0,15) } })} className={baseInput} placeholder="GSTIN..." />
                </div>
              </>
            )}
          </div>

          {/* Password section */}
          <div className="pt-4 space-y-5 border-t border-gray-50">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600 ml-0.5">Enter Current Password to Save</label>
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full h-11 px-4 bg-blue-50/50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all text-sm font-semibold placeholder:text-blue-200" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">New Password (Optional)</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className={baseInput} placeholder="••••••••" />
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
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={baseInput} placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-[#1e293b] text-white rounded-xl font-bold uppercase tracking-[0.15em] text-[11px] hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : <><Save size={14} /> Update Account</>}
          </button>
        </form>
      </div>

      <FeedbackModal
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback(p => ({ ...p, show: false }))}
      />
    </div>
  );
}