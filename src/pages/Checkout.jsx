import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, CreditCard, ArrowLeft, CheckCircle, ImageIcon,
  Plus, Edit2, Trash2, MapPin, Check, X, Loader2, AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUtils';

const API = import.meta.env.VITE_API_URL || "/api";

// ─── Strict email: nothing allowed after the TLD (e.g. .comweweq → invalid) ──
const isValidEmail = (v) => {
  if (!v) return false;
  // Must match: local@domain.tld with tld 2-6 chars only
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/.test(v);
};

const phoneRegex = /^[0-9]{10,15}$/;

// ─── Indian Cities ─────────────────────────────────────────────────────────────
const INDIAN_CITIES = [
  'Agra','Ahmedabad','Aizawl','Ajmer','Aligarh','Allahabad','Amravati','Amritsar',
  'Asansol','Aurangabad','Bangalore','Bareilly','Bhopal','Bhubaneswar','Chandigarh',
  'Chennai','Coimbatore','Cuttack','Dehradun','Delhi','Dhanbad','Durgapur',
  'Faridabad','Ghaziabad','Gurugram','Guwahati','Gwalior','Hubli','Hyderabad',
  'Imphal','Indore','Itanagar','Jabalpur','Jaipur','Jammu','Jamshedpur','Jodhpur',
  'Kanpur','Kochi','Kohima','Kolkata','Kozhikode','Lucknow','Ludhiana','Madurai',
  'Mangalore','Meerut','Mumbai','Mysore','Nagpur','Nashik','Navi Mumbai','Noida',
  'Patna','Pune','Raipur','Rajkot','Ranchi','Shillong','Shimla','Siliguri',
  'Srinagar','Surat','Thiruvananthapuram','Thane','Tiruchirappalli','Udaipur',
  'Vadodara','Varanasi','Vijayawada','Visakhapatnam','Warangal',
];

// ─── Indian States ─────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  'Andaman & Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam',
  'Bihar','Chandigarh','Chhattisgarh','Dadra & Nagar Haveli','Daman & Diu',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu & Kashmir',
  'Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
  'Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];

// ─── Countries ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { name: 'India', dial: '+91' },
  { name: 'United States', dial: '+1' },
  { name: 'United Kingdom', dial: '+44' },
  { name: 'Canada', dial: '+1' },
  { name: 'Australia', dial: '+61' },
  { name: 'United Arab Emirates', dial: '+971' },
  { name: 'Singapore', dial: '+65' },
  { name: 'Germany', dial: '+49' },
  { name: 'France', dial: '+33' },
  { name: 'Japan', dial: '+81' },
  { name: 'China', dial: '+86' },
  { name: 'Brazil', dial: '+55' },
  { name: 'South Africa', dial: '+27' },
  { name: 'Pakistan', dial: '+92' },
  { name: 'Bangladesh', dial: '+880' },
  { name: 'Sri Lanka', dial: '+94' },
  { name: 'Nepal', dial: '+977' },
  { name: 'Malaysia', dial: '+60' },
  { name: 'Indonesia', dial: '+62' },
];

const COUNTRY_NAMES = COUNTRIES.map(c => c.name);
const getDialCode = (country) => COUNTRIES.find(c => c.name === country)?.dial || '+91';
const EMAIL_DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','protonmail.com','ymail.com'];

// ─── SuggestInput ─────────────────────────────────────────────────────────────
function SuggestInput({ label, name, value, onChange, suggestions = [], required, placeholder }) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const ref = useRef(null);

  const filtered = value
    ? suggestions.filter(s => s.toLowerCase().startsWith(value.toLowerCase()))
    : [];
  const show = open && filtered.length > 0;

  useEffect(() => { setActiveIdx(-1); }, [value]);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const pick = (val) => { onChange({ target: { name, value: val } }); setOpen(false); };

  const onKeyDown = (e) => {
    if (!show) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); pick(filtered[activeIdx]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{label}</label>}
      <input
        required={required}
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={onChange}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent font-medium text-sm"
      />
      <AnimatePresence>
        {show && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 right-0 z-50 bg-white border border-gray-100 rounded-xl shadow-2xl mt-1 py-1 overflow-y-auto"
            style={{ maxHeight: 200, scrollbarWidth: 'thin' }}
          >
            {filtered.map((item, i) => (
              <li
                key={item}
                onMouseDown={() => pick(item)}
                className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${i === activeIdx ? 'bg-action/10 text-action' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="font-bold text-action">{item.slice(0, value.length)}</span>
                <span className="text-gray-600">{item.slice(value.length)}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── EmailInput ───────────────────────────────────────────────────────────────
// Prevents typing after a valid TLD (.com, .in, etc.) — shows error immediately
function EmailInput({ label, name = 'email', value, onChange, required, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const valid   = isValidEmail(value);
  const invalid = value && !valid;

  const atIdx   = value?.indexOf('@') ?? -1;
  const local   = atIdx >= 0 ? value.slice(0, atIdx) : value;
  const afterAt = atIdx >= 0 ? value.slice(atIdx + 1) : '';
  const suggestions = atIdx >= 0
    ? EMAIL_DOMAINS
        .filter(d => d.startsWith(afterAt) && `${local}@${d}` !== value)
        .map(d => `${local}@${d}`)
    : [];

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const pick = (val) => { onChange({ target: { name, value: val } }); setOpen(false); };

  // Block input after a recognized complete domain (e.g. harish@gmail.com → stop)
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\s/g, '');
    // If user is typing after a valid email (adding chars after complete TLD), block it
    if (raw.length > (value?.length || 0) && isValidEmail(value)) {
      // Already valid — don't allow more chars
      return;
    }
    onChange({ target: { name, value: raw } });
    setOpen(true);
  };

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{label}</label>}
      <div className={`relative border-b transition-colors ${invalid ? 'border-red-300 focus-within:border-red-400' : 'border-gray-200 focus-within:border-action'}`}>
        <input
          required={required}
          name={name}
          type="text"
          value={value}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          className={`w-full py-3 pr-7 focus:outline-none bg-transparent font-medium text-sm ${disabled ? 'text-gray-400 cursor-not-allowed' : ''}`}
        />
        {value && (
          <span className="absolute right-0 bottom-3">
            {valid ? <Check className="text-green-500" size={16} /> : <AlertCircle className="text-red-400" size={16} />}
          </span>
        )}
      </div>
      {invalid && (
        <p className="text-[10px] text-red-400 mt-1 font-medium">
          {value.includes('@')
            ? 'Invalid email — domain must end with .com, .in etc. (no extra characters)'
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
          >
            {suggestions.map(s => (
              <li
                key={s}
                onMouseDown={() => pick(s)}
                className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <span className="text-gray-400">{local}</span>
                <span className="font-bold text-action">@{s.split('@')[1]}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PhoneInput ───────────────────────────────────────────────────────────────
function PhoneInput({ label, value, dialCode, onChange, required }) {
  const isValid   = value && phoneRegex.test(value);
  const isInvalid = value && !phoneRegex.test(value);
  return (
    <div>
      {label && <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{label}</label>}
      <div className={`flex items-center border-b transition-colors ${isInvalid ? 'border-red-300' : 'border-gray-200 focus-within:border-action'}`}>
        <span className="text-sm font-bold text-gray-500 pr-3 mr-3 border-r border-gray-200 py-3 shrink-0 select-none tabular-nums">
          {dialCode}
        </span>
        <input
          required={required}
          type="tel"
          value={value}
          placeholder="Phone number"
          onChange={e => onChange({ target: { name: 'phone', value: e.target.value.replace(/[^0-9]/g, '').slice(0, 15) } })}
          className="flex-1 py-3 focus:outline-none bg-transparent font-medium text-sm"
        />
        {value && (
          <span className="ml-2 shrink-0">
            {isValid ? <Check className="text-green-500" size={16} /> : <AlertCircle className="text-red-400" size={16} />}
          </span>
        )}
      </div>
      {isInvalid && <p className="text-[10px] text-red-400 mt-1 font-medium">Must be 10–15 digits, numbers only</p>}
    </div>
  );
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const userInfo  = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const userEmail = userInfo?.email || '';

  const [loading,         setLoading]         = useState(false);
  const [orderComplete,   setOrderComplete]   = useState(false);
  const [newOrderId,      setNewOrderId]      = useState('');
  const [finalAmount,     setFinalAmount]     = useState(0);
  const [exchangeContext, setExchangeContext] = useState(null);

  useEffect(() => {
    if (!userInfo) navigate('/login');
    try { const s = localStorage.getItem('exchangeContext'); if (s) setExchangeContext(JSON.parse(s)); } catch {}
  }, []);

  const [savedAddresses,    setSavedAddresses]    = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);
  const [showAddressModal,  setShowAddressModal]  = useState(false);
  const [editingAddress,    setEditingAddress]    = useState(null);
  const [pincodeLoading,    setPincodeLoading]    = useState(false);

  const blankForm = (isFirst = false) => ({
    name: '', street: '', city: '', state: '', zip: '', phone: '', country: 'India', isDefault: isFirst,
  });

  const [addressForm, setAddressForm] = useState(blankForm());
  const [ship, setShip] = useState({
    firstName: userInfo?.name?.split(' ')[0] || '',
    lastName:  userInfo?.name?.split(' ').slice(1).join(' ') || '',
    email: userEmail, phone: '',
    address: '', city: '', state: '', zip: '', country: 'India',
  });

  const setS = (k, v) => setShip(p => ({ ...p, [k]: v }));
  const setF = (k, v) => setAddressForm(p => ({ ...p, [k]: v }));

  useEffect(() => { if (userEmail) fetchAddresses(); }, [userEmail]);

  const fetchAddresses = async () => {
    setFetchingAddresses(true);
    try {
      const { data } = await axios.get(`${API}/addresses?email=${userEmail}`);
      setSavedAddresses(data || []);
      const def = data.find(a => a.isDefault) || data[0];
      if (def) { setSelectedAddressId(def._id); applyAddress(def); }
    } catch {}
    finally { setFetchingAddresses(false); }
  };

  // Pincode → city/state (main form)
  useEffect(() => {
    if (ship.zip?.length === 6 && /^\d+$/.test(ship.zip)) {
      setPincodeLoading(true);
      axios.get(`https://api.postalpincode.in/pincode/${ship.zip}`)
        .then(({ data }) => {
          if (data?.[0]?.Status === 'Success') {
            const po = data[0].PostOffice[0];
            setShip(p => ({ ...p, city: po.District, state: po.State }));
          }
        }).catch(() => {}).finally(() => setPincodeLoading(false));
    }
  }, [ship.zip]);

  // Pincode → city/state (modal)
  useEffect(() => {
    if (addressForm.zip?.length === 6 && /^\d+$/.test(addressForm.zip)) {
      setPincodeLoading(true);
      axios.get(`https://api.postalpincode.in/pincode/${addressForm.zip}`)
        .then(({ data }) => {
          if (data?.[0]?.Status === 'Success') {
            const po = data[0].PostOffice[0];
            setAddressForm(p => ({ ...p, city: po.District, state: po.State }));
          }
        }).catch(() => {}).finally(() => setPincodeLoading(false));
    }
  }, [addressForm.zip]);

  const applyAddress = (addr) => setShip({
    firstName: addr.name.split(' ')[0] || '',
    lastName:  addr.name.split(' ').slice(1).join(' ') || '',
    email: userEmail, phone: addr.phone || '',
    address: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country || 'India',
  });

  const handleOpenModal = (addr = null) => {
    if (addr) { setEditingAddress(addr); setAddressForm({ ...addr, country: addr.country || 'India' }); }
    else       { setEditingAddress(null); setAddressForm(blankForm(savedAddresses.length === 0)); }
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!phoneRegex.test(addressForm.phone)) return alert('Phone must be 10–15 digits.');
    setLoading(true);
    try {
      if (editingAddress) await axios.put(`${API}/addresses`, { email: userEmail, addressId: editingAddress._id, address: addressForm });
      else                await axios.post(`${API}/addresses`, { email: userEmail, address: addressForm });
      setShowAddressModal(false); fetchAddresses();
    } catch { alert('Error saving address.'); }
    finally { setLoading(false); }
  };

  const handleDeleteAddress = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this address?')) return;
    try { await axios.delete(`${API}/addresses?email=${userEmail}&addressId=${id}`); fetchAddresses(); } catch { alert('Error.'); }
  };

  const loadRazorpay = () => new Promise(res => {
    if (window.Razorpay) return res(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    if (!isValidEmail(ship.email)) return alert('Please enter a valid email address.');
    if (!phoneRegex.test(ship.phone)) return alert('Phone must be 10–15 digits.');
    setLoading(true);
    try {
      const discount     = exchangeContext ? Number(exchangeContext.oldTotal) || 0 : 0;
      const finalPayable = Math.max(0, Number(cartTotal) - discount);
      const buildItems   = (arr) => arr.map(i => ({ product: i._id, name: i.name, quantity: i.quantity, price: Number(i.price) || 0, image: i.image || i.images?.[0] || '', variant: i.selectedVariant, customColor: i.customColor, customDimensions: i.customDimensions }));
      const shippingAddr = { name: `${ship.firstName} ${ship.lastName}`, address: ship.address, city: ship.city, state: ship.state, zip: ship.zip, phone: `${getDialCode(ship.country)}${ship.phone}`, country: ship.country };

      if (finalPayable <= 0 && exchangeContext) {
        const res = await axios.post(`${API}/payment/verify-payment`, { razorpay_order_id: 'order_exchange_' + Date.now(), razorpay_payment_id: 'pay_exchange_' + Date.now(), razorpay_signature: 'mock', orderDetails: { user: userEmail, items: buildItems(cartItems), totalAmount: finalPayable, shippingAddress: shippingAddr } });
        if (res.status === 200) { await axios.put(`${API}/orders/${exchangeContext.oldOrderId}`, { status: 'Replacement Completed' }); localStorage.removeItem('exchangeContext'); setFinalAmount(finalPayable); setOrderComplete(true); setNewOrderId(res.data.orderId); clearCart(); }
        return;
      }

      if (!await loadRazorpay()) { alert('Razorpay SDK failed.'); return; }
      const { data: kd } = await axios.get(`${API}/payment/get-key`);
      const { data: od } = await axios.post(`${API}/payment/create-order`, { amount: finalPayable, receipt: `receipt_${Date.now()}`, orderDetails: { user: userEmail, replacementFor: exchangeContext?.oldOrderId || null, items: buildItems(cartItems), totalAmount: finalPayable, shippingAddress: shippingAddr } });

      new window.Razorpay({
        key: kd.key, amount: od.amount, currency: od.currency,
        name: 'Cromsen Importers', description: 'Luxury Blinds & Curtains', order_id: od.id,
        handler: async (response) => {
          try {
            const vr = await axios.post(`${API}/payment/verify-payment`, { razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, orderDetails: { user: ship.email, items: buildItems(cartItems), totalAmount: finalPayable, shippingAddress: shippingAddr } });
            if (vr.data.message === 'Payment verified successfully') {
              if (exchangeContext) { await axios.put(`${API}/orders/${exchangeContext.oldOrderId}`, { status: 'Replacement Completed', replacementOrderId: vr.data.orderId }); localStorage.removeItem('exchangeContext'); }
              setFinalAmount(finalPayable); setOrderComplete(true); setNewOrderId(vr.data.orderId); clearCart();
            }
          } catch (err) { alert(`Verification failed: ${err.response?.data?.message || err.message}`); }
        },
        prefill: { name: `${ship.firstName} ${ship.lastName}`, email: ship.email, contact: `${getDialCode(ship.country)}${ship.phone}` },
        theme: { color: '#162d3a' },
      }).open();
    } catch (err) { alert(`Payment error: ${err.response?.data?.message || err.message}`); }
    finally { setLoading(false); }
  };

  const canPay = isValidEmail(ship.email) && phoneRegex.test(ship.phone) && !loading;
  const L  = "block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2";
  const FI = "w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent font-medium text-sm";

  if (orderComplete) return (
    <div className="min-h-screen pt-40 pb-20 flex flex-col items-center bg-white text-center px-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle size={48} /></motion.div>
      <h2 className="text-4xl font-serif text-primary mb-4 font-bold">Order Confirmed!</h2>
      <p className="text-gray-500 mb-2 max-w-sm">Thank you for your purchase.</p>
      <p className="text-2xl font-serif text-primary font-bold mb-2">Amount Paid: ₹{(Number(finalAmount) || 0).toFixed(2)}</p>
      <p className="text-action font-bold mb-8">Order ID: #{newOrderId.slice(-8).toUpperCase()}</p>
      <Link to="/shop" className="bg-primary text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-action transition-all shadow-xl">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 font-sans">
      <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8 text-gray-400 hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          <Link to="/cart" className="text-xs uppercase tracking-widest font-bold">Back to Cart</Link>
        </div>
        <h1 className="text-4xl font-serif mb-12 text-primary font-bold">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT */}
          <div className="lg:col-span-7 space-y-8">

            {/* Saved addresses */}
            <div className="bg-white p-8 md:p-10 shadow-sm border border-gray-100 rounded-xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-serif text-primary flex items-center gap-2 font-bold"><MapPin size={22} className="text-action" /> Shipping Address</h2>
                <button onClick={() => handleOpenModal()} className="text-action text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-primary transition-colors"><Plus size={15} /> Add New</button>
              </div>
              {fetchingAddresses
                ? <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
                : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map(addr => (
                      <div key={addr._id} onClick={() => { setSelectedAddressId(addr._id); applyAddress(addr); }}
                        className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-action bg-action/5 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
                        {selectedAddressId === addr._id && <div className="absolute top-4 right-4 text-action bg-white rounded-full p-1 shadow-sm"><Check size={13} strokeWidth={3} /></div>}
                        <p className="font-bold text-gray-900 mb-1">{addr.name}</p>
                        <p className="text-sm text-gray-500 leading-relaxed mb-3">{addr.street}, {addr.city}, {addr.state} – {addr.zip}</p>
                        <p className="text-xs text-gray-400 font-medium">{getDialCode(addr.country)} {addr.phone}</p>
                        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
                          <button onClick={e => { e.stopPropagation(); handleOpenModal(addr); }} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-action flex items-center gap-1"><Edit2 size={11} /> Edit</button>
                          <button onClick={e => handleDeleteAddress(e, addr._id)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-500 flex items-center gap-1"><Trash2 size={11} /> Delete</button>
                        </div>
                      </div>
                    ))}
                    {savedAddresses.length === 0 && (
                      <div className="md:col-span-2 py-10 text-center border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-gray-400 text-sm mb-2">No saved addresses.</p>
                        <button onClick={() => handleOpenModal()} className="text-action font-bold uppercase text-[10px] tracking-widest">Create First Address</button>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Confirm details */}
            <div className="bg-white p-8 md:p-10 shadow-sm border border-gray-100 rounded-xl">
              <h2 className="text-xl font-serif text-primary mb-8 flex items-center gap-2 font-bold"><Truck size={22} className="text-action" /> Confirm Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className={L}>First Name</label>
                  <input required value={ship.firstName} onChange={e => setS('firstName', e.target.value)} className={FI} />
                </div>
                <div>
                  <label className={L}>Last Name</label>
                  <input required value={ship.lastName} onChange={e => setS('lastName', e.target.value)} className={FI} />
                </div>

                <div className="md:col-span-2">
                  <EmailInput label="Email Address" value={ship.email} onChange={e => setS('email', e.target.value)} required />
                </div>

                <div className="md:col-span-2">
                  <PhoneInput label="Phone Number" value={ship.phone} dialCode={getDialCode(ship.country)} onChange={e => setS('phone', e.target.value)} required />
                </div>

                <div className="md:col-span-2">
                  <label className={L}>Street Address</label>
                  <input required value={ship.address} onChange={e => setS('address', e.target.value)} className={FI} />
                </div>

                <div className="relative">
                  <label className={L}>Pincode / Zip</label>
                  <input required value={ship.zip} onChange={e => setS('zip', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="6-digit PIN" maxLength={6} className={FI} />
                  {pincodeLoading && <Loader2 className="absolute right-0 bottom-3 animate-spin text-action" size={15} />}
                  <p className="text-[10px] text-gray-400 mt-1">City &amp; State auto-fill on valid PIN</p>
                </div>

                {/* City with suggestions */}
                <SuggestInput
                  label="City"
                  name="city"
                  value={ship.city}
                  onChange={e => setS('city', e.target.value)}
                  suggestions={INDIAN_CITIES}
                  required
                  placeholder="Type to search city..."
                />

                {/* State with suggestions */}
                <SuggestInput
                  label="State"
                  name="state"
                  value={ship.state}
                  onChange={e => setS('state', e.target.value)}
                  suggestions={INDIAN_STATES}
                  required
                  placeholder="Type to search state..."
                />

                {/* Country with suggestions */}
                <SuggestInput
                  label="Country"
                  name="country"
                  value={ship.country}
                  onChange={e => setS('country', e.target.value)}
                  suggestions={COUNTRY_NAMES}
                  required
                  placeholder="Type to search country..."
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 md:p-10 shadow-xl border border-gray-100 rounded-2xl sticky top-32">
              <h2 className="text-xl font-serif text-primary mb-8 font-bold border-b border-gray-50 pb-4">Order Summary</h2>
              <div className="max-h-60 overflow-y-auto mb-8 pr-2" style={{ scrollbarWidth: 'thin' }}>
                {cartItems.map(item => (
                  <div key={item._id} className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                      {getImageUrl(item.image || item.images?.[0]) ? <img src={getImageUrl(item.image || item.images?.[0])} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-200" />}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-serif text-primary font-bold line-clamp-1">{item.name}</p>
                      {item.selectedVariant && <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Variant: {item.selectedVariant}</p>}
                      {item.customColor && <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Color: {item.customColor}</p>}
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4 mb-10 text-sm border-t border-gray-50 pt-6">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-bold text-primary">₹{(Number(cartTotal) || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Free</span></div>
                {exchangeContext && (
                  <div className="flex justify-between bg-blue-50/50 p-2 rounded -mx-2">
                    <span className="text-blue-700">Exchange Credit<br /><span className="text-[10px] text-blue-500 uppercase">#{exchangeContext.oldOrderId.slice(-8)}</span></span>
                    <span className="font-bold text-blue-700">-₹{(Number(exchangeContext.oldTotal) || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xl font-serif text-primary font-bold">Total Payable</span>
                  <span className="text-2xl font-bold text-action">₹{Math.max(0, (Number(cartTotal) || 0) - (exchangeContext ? Number(exchangeContext.oldTotal) || 0 : 0)).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={handlePayment} disabled={!canPay}
                className={`w-full bg-primary text-white py-5 rounded-xl text-sm font-bold uppercase tracking-[0.2em] hover:bg-action transition-all shadow-xl flex items-center justify-center gap-3 ${!canPay ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><CreditCard size={18} /> Pay Now via Razorpay</>}
              </button>
              <div className="mt-6 flex items-center justify-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
                <img src="https://cdn.razorpay.com/static/assets/logo/payment_method_visa.svg" className="h-4" alt="Visa" />
                <img src="https://cdn.razorpay.com/static/assets/logo/payment_method_mastercard.svg" className="h-4" alt="Mastercard" />
                <img src="https://cdn.razorpay.com/static/assets/logo/payment_method_upi.svg" className="h-6" alt="UPI" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddressModal(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden max-h-[92vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <h3 className="text-lg font-serif font-bold text-primary">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveAddress} className="p-8 space-y-5 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>

                <div>
                  <label className={L}>Full Name</label>
                  <input required value={addressForm.name} onChange={e => setF('name', e.target.value)} placeholder="Recipient name" className={FI} />
                </div>

                <div>
                  <label className={L}>Street Address</label>
                  <input required value={addressForm.street} onChange={e => setF('street', e.target.value)} placeholder="Building, Street, Area" className={FI} />
                </div>

                <div className="relative">
                  <label className={L}>Pincode</label>
                  <input required value={addressForm.zip} onChange={e => setF('zip', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="6-digit PIN" maxLength={6} className={FI} />
                  {pincodeLoading && <Loader2 className="absolute right-0 bottom-3 animate-spin text-action" size={15} />}
                  <p className="text-[10px] text-gray-400 mt-1">City &amp; State auto-fill on valid PIN</p>
                </div>

                {/* City with suggestions */}
                <SuggestInput
                  label="City"
                  name="city"
                  value={addressForm.city}
                  onChange={e => setF('city', e.target.value)}
                  suggestions={INDIAN_CITIES}
                  required
                  placeholder="Type to search city..."
                />

                {/* State with suggestions */}
                <SuggestInput
                  label="State"
                  name="state"
                  value={addressForm.state}
                  onChange={e => setF('state', e.target.value)}
                  suggestions={INDIAN_STATES}
                  required
                  placeholder="Type to search state..."
                />

                {/* Country with suggestions */}
                <SuggestInput
                  label="Country"
                  name="country"
                  value={addressForm.country}
                  onChange={e => setF('country', e.target.value)}
                  suggestions={COUNTRY_NAMES}
                  required
                  placeholder="Type to search country..."
                />

                <PhoneInput
                  label="Phone Number"
                  value={addressForm.phone}
                  dialCode={getDialCode(addressForm.country)}
                  onChange={e => setF('phone', e.target.value)}
                  required
                />

                <div className="flex items-center gap-3 pt-1">
                  <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setF('isDefault', e.target.checked)} className="w-4 h-4 accent-action" />
                  <label htmlFor="isDefault" className="text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer">Set as default address</label>
                </div>

                <button type="submit" disabled={loading || (addressForm.phone && !phoneRegex.test(addressForm.phone))}
                  className="w-full bg-primary text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-action transition-all shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (editingAddress ? 'Update Address' : 'Save Address')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;