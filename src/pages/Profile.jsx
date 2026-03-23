import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { User, Camera, Save, ArrowLeft, Check, AlertCircle, ZoomIn, ZoomOut, RotateCcw, Upload, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FeedbackModal from "../components/FeedbackModal";
import { getImageUrl } from "../utils/imageUtils";

// ─── Validators ───────────────────────────────────────────────────────────────
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
    if (raw.length > (value?.length || 0) && isValidEmail(value)) return;
    onChange({ target: { name: 'email', value: raw } });
    setOpen(true);
  };
  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input required={required} type="text" name="email" value={value} autoComplete="off" spellCheck={false}
          onChange={handleChange} onFocus={() => setOpen(true)}
          className={`${inputClassName} pr-10 ${value ? (valid ? 'ring-1 ring-green-500/30' : 'ring-1 ring-red-400/40') : ''}`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {valid ? <Check size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-400" />}
          </div>
        )}
      </div>
      {invalid && <p className="text-[10px] text-red-400 mt-1 font-medium">{value.includes('@') ? 'Nothing allowed after .com / .in' : 'Enter a valid email — e.g. name@gmail.com'}</p>}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 z-50 bg-white border border-gray-100 rounded-xl shadow-2xl mt-1 py-1 overflow-hidden"
          >
            {suggestions.map(s => (
              <li key={s} onMouseDown={() => pick(s)} className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 font-medium text-gray-700">
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
        <input type="tel" name="phone" value={value} placeholder="10–15 digits only"
          onChange={e => onChange({ target: { name: 'phone', value: e.target.value.replace(/[^0-9]/g, '').slice(0, 15) } })}
          className={`${inputClassName} pr-10 ${value ? (isValid ? 'ring-1 ring-green-500/30' : 'ring-1 ring-red-400/40') : ''}`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? <Check size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-400" />}
          </div>
        )}
      </div>
      {isInvalid && <p className="text-[10px] text-red-400 mt-1 font-medium">Must be 10–15 digits, numbers only</p>}
    </div>
  );
}

// ─── Inline Crop Section ──────────────────────────────────────────────────────
function InlineCrop({ imageSrc, onConfirm, onCancel }) {
  const canvasRef  = useRef(null);
  const imageRef   = useRef(new Image());
  const dragging   = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });
  const [zoom,   setZoom]   = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  const SIZE = 280;

  useEffect(() => {
    const img = imageRef.current;
    img.onload = () => { setLoaded(true); setZoom(1); setOffset({ x: 0, y: 0 }); };
    img.src = imageSrc;
  }, [imageSrc]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    const r   = SIZE / 2;
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Draw image
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.clip();
    const scaledW = img.naturalWidth  * zoom;
    const scaledH = img.naturalHeight * zoom;
    ctx.drawImage(img, r - scaledW / 2 + offset.x, r - scaledH / 2 + offset.y, scaledW, scaledH);
    ctx.restore();

    // Dark outside overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(r, r, r - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Circle border
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r, r, r - 1, 0, Math.PI * 2);
    ctx.stroke();
  }, [loaded, zoom, offset]);

  useEffect(() => { draw(); }, [draw]);

  const onPointerDown = (e) => {
    dragging.current = true;
    const pt = e.touches ? e.touches[0] : e;
    lastPos.current = { x: pt.clientX, y: pt.clientY };
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - lastPos.current.x;
    const dy = pt.clientY - lastPos.current.y;
    lastPos.current = { x: pt.clientX, y: pt.clientY };
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };
  const onPointerUp = () => { dragging.current = false; };
  const onWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(4, Math.max(0.3, z - e.deltaY * 0.001)));
  };

  const handleConfirm = () => {
    const out = document.createElement('canvas');
    out.width = SIZE; out.height = SIZE;
    const ctx = out.getContext('2d');
    const img = imageRef.current;
    const r   = SIZE / 2;
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.clip();
    const scaledW = img.naturalWidth  * zoom;
    const scaledH = img.naturalHeight * zoom;
    ctx.drawImage(img, r - scaledW / 2 + offset.x, r - scaledH / 2 + offset.y, scaledW, scaledH);
    out.toBlob(blob => { if (blob) onConfirm(blob); }, 'image/png', 0.95);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="bg-gray-900 rounded-2xl p-5 flex flex-col items-center gap-4 border border-white/10 shadow-2xl"
    >
      <div className="w-full flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-bold">Crop your photo</p>
          <p className="text-white/40 text-[10px] mt-0.5">Drag · Scroll or slider to zoom</p>
        </div>
        <button onClick={onCancel} className="text-white/30 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Canvas */}
      <div className="rounded-full overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl border-2 border-white/10">
        <canvas
          ref={canvasRef}
          width={SIZE} height={SIZE}
          onMouseDown={onPointerDown} onMouseMove={onPointerMove}
          onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
          onWheel={onWheel}
          style={{ display: 'block', borderRadius: '50%', touchAction: 'none' }}
        />
      </div>

      {/* Zoom slider */}
      <div className="w-full flex items-center gap-3">
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="text-white/50 hover:text-white transition-colors">
          <ZoomOut size={15} />
        </button>
        <input
          type="range" min="0.3" max="4" step="0.05" value={zoom}
          onChange={e => setZoom(parseFloat(e.target.value))}
          className="flex-1 accent-blue-500 cursor-pointer"
        />
        <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} className="text-white/50 hover:text-white transition-colors">
          <ZoomIn size={15} />
        </button>
      </div>

      {/* Buttons */}
      <div className="w-full flex gap-3">
        <button
          onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          <RotateCcw size={11} /> Reset
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg"
        >
          <Check size={11} /> Use This Photo
        </button>
      </div>
    </motion.div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function Profile() {
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: 'success', message: '' });
  const [user, setUser]         = useState(null);
  const [cropSrc, setCropSrc]   = useState(null); // shows inline crop when set
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
        setFormData(p => ({
          ...p,
          name: res.data.name || '', email: res.data.email || '',
          phone: res.data.phone || '', company: res.data.company || '',
          companyAddress: res.data.companyAddress || '',
          gstNumber: res.data.gstNumber || '', avatar: res.data.avatar || '',
        }));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  // Step 1: pick file → show inline crop
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
  };

  // Step 2: crop confirmed → upload blob
  const handleCropConfirm = async (blob) => {
    URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    const fd = new FormData();
    fd.append('avatar', blob, 'avatar.png');
    try {
      setSaving(true);
      const res = await axios.post(
        `/api/users/${loggedUser._id}/upload-avatar`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const newAvatar = res.data.avatar;
      setFormData(p => ({ ...p, avatar: newAvatar }));
      const updatedUser = { ...loggedUser, avatar: newAvatar };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      // Notify Navbar to re-read localStorage
      window.dispatchEvent(new Event('avatar-updated'));
      setFeedback({ show: true, type: 'success', message: 'Profile photo updated!' });
    } catch (err) {
      setFeedback({ show: true, type: 'error', message: err.response?.data?.message || 'Upload failed.' });
    } finally { setSaving(false); }
  };

  const handleCropCancel = () => {
    URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-gray-100', width: '0%' };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(formData.email))
      return setFeedback({ show: true, type: 'error', message: 'Please enter a valid email address.' });
    if (formData.phone && !phoneRegex.test(formData.phone))
      return setFeedback({ show: true, type: 'error', message: 'Phone number must be 10–15 digits.' });
    if (formData.gstNumber && !gstRegex.test(formData.gstNumber))
      return setFeedback({ show: true, type: 'error', message: 'Enter a valid 15-character GST number.' });
    if (!formData.currentPassword)
      return setFeedback({ show: true, type: 'error', message: 'Current password is required to save changes.' });
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword)
      return setFeedback({ show: true, type: 'error', message: 'New passwords do not match.' });

    setSaving(true);
    try {
      const { confirmPassword, newPassword, ...submitData } = formData;
      if (newPassword) submitData.password = newPassword;
      const res = await axios.put(`/api/users/${loggedUser._id}/profile`, submitData);
      const updatedUser = { ...loggedUser, name: res.data.name, avatar: res.data.avatar };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('avatar-updated'));
      setUser(res.data);
      setFormData(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setFeedback({ show: true, type: 'success', message: 'Account updated successfully.' });
    } catch (err) {
      setFeedback({ show: true, type: 'error', message: err.response?.data?.message || 'Update failed. Check your current password.' });
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">Loading...</div>
  );

  const baseInput = "w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-50 focus:bg-white outline-none transition-all text-sm font-semibold";

  return (
    <div className="max-w-xl mx-auto px-6 py-10 mt-16">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        <Link to="/home" className="text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <div className="space-y-8">

        {/* ── Avatar Section ─────────────────────────────────────────────── */}
        <div className="pb-8 border-b border-gray-100">

          {/* Avatar preview + change button (always visible) */}
          <div className="flex items-center gap-5 mb-4">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => !cropSrc && fileInputRef.current.click()}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center shadow-inner">
                {formData.avatar
                  ? <img src={getImageUrl(formData.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                  : <User size={32} className="text-gray-300" />
                }
              </div>
              {!cropSrc && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-full">
                  <Camera className="text-white" size={18} />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-800 leading-tight">{formData.name || user?.name}</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{user?.role} Account</p>
              {!cropSrc && (
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:text-blue-800 transition-colors"
                >
                  <Upload size={11} /> {formData.avatar ? 'Change Photo' : 'Upload Photo'}
                </button>
              )}
            </div>

            <input
              type="file" ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" accept="image/*"
            />
          </div>

          {/* Inline crop — slides in below the avatar when a file is selected */}
          <AnimatePresence>
            {cropSrc && (
              <InlineCrop
                imageSrc={cropSrc}
                onConfirm={handleCropConfirm}
                onCancel={handleCropCancel}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Profile Form ───────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={baseInput} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Email</label>
              <EmailInput value={formData.email} onChange={handleChange} required inputClassName={baseInput} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">Phone</label>
              <PhoneInput value={formData.phone} onChange={handleChange} inputClassName={baseInput} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">
                {user?.role === 'dealer' ? 'Company Name' : 'Company'}
              </label>
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
                  <input
                    type="text" name="gstNumber" value={formData.gstNumber}
                    onChange={e => handleChange({ target: { name: 'gstNumber', value: e.target.value.toUpperCase().slice(0, 15) } })}
                    className={baseInput} placeholder="GSTIN..."
                  />
                </div>
              </>
            )}
          </div>

          {/* Password */}
          <div className="pt-4 space-y-5 border-t border-gray-50">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600 ml-0.5">Enter Current Password to Save</label>
              <input
                type="password" name="currentPassword" value={formData.currentPassword}
                onChange={handleChange} required
                className="w-full h-11 px-4 bg-blue-50/50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all text-sm font-semibold placeholder:text-blue-200"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-0.5">New Password (Optional)</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className={baseInput} placeholder="••••••••" />
                {formData.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
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
            type="submit" disabled={saving || !!cropSrc}
            className="w-full h-12 bg-[#1e293b] text-white rounded-xl font-bold uppercase tracking-[0.15em] text-[11px] hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : <><Save size={14} /> Update Account</>}
          </button>

          {cropSrc && (
            <p className="text-center text-[10px] text-amber-500 font-bold uppercase tracking-widest -mt-4">
              Please confirm or cancel the photo crop above first
            </p>
          )}
        </form>
      </div>

      <FeedbackModal
        show={feedback.show} type={feedback.type} message={feedback.message}
        onClose={() => setFeedback(p => ({ ...p, show: false }))}
      />
    </div>
  );
}