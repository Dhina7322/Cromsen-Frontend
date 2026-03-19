import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  ImageIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUtils';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  // User & Auth
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const userEmail = userInfo?.email || '';

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [newOrderId, setNewOrderId] = useState('');
  const [exchangeContext, setExchangeContext] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('exchangeContext');
      if (stored) {
        setExchangeContext(JSON.parse(stored));
      }
    } catch(e) {}
  }, []);

  // Address Management State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [addressForm, setAddressForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    isDefault: false
  });

  const [shippingData, setShippingData] = useState({
    firstName: userInfo?.name?.split(' ')[0] || '',
    lastName: userInfo?.name?.split(' ')[1] || '',
    email: userEmail,
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    if (userEmail) {
      fetchAddresses();
    }
  }, [userEmail]);

  const fetchAddresses = async () => {
    setFetchingAddresses(true);
    try {
      const { data } = await axios.get(`/api/addresses?email=${userEmail}`);
      setSavedAddresses(data || []);
      const defaultAddr = data.find(a => a.isDefault) || data[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        applyAddress(defaultAddr);
      }
    } catch (err) {
      console.error("Error fetching addresses", err);
    } finally {
      setFetchingAddresses(false);
    }
  };

  const applyAddress = (addr) => {
    setShippingData({
      firstName: addr.name.split(' ')[0] || '',
      lastName: addr.name.split(' ').slice(1).join(' ') || '',
      email: userEmail,
      phone: addr.phone,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.zip, // and zip
      zip: addr.zip
    });
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    applyAddress(addr);
  };

  const handleOpenModal = (addr = null) => {
    if (addr) {
      setEditingAddress(addr);
      setAddressForm({ ...addr });
    } else {
      setEditingAddress(null);
      setAddressForm({
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        isDefault: savedAddresses.length === 0
      });
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAddress) {
        await axios.put('/api/addresses', {
          email: userEmail,
          addressId: editingAddress._id,
          address: addressForm
        });
      } else {
        await axios.post('/api/addresses', {
          email: userEmail,
          address: addressForm
        });
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      alert("Error saving address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this address?")) return;
    try {
      await axios.delete(`/api/addresses?email=${userEmail}&addressId=${id}`);
      fetchAddresses();
    } catch (err) {
      alert("Error deleting address");
    }
  };

  const handleInputChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const handleFormInputChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setAddressForm({ ...addressForm, [e.target.name]: val });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      if (!cartTotal || cartTotal < 0) {
        return alert("Your cart is empty or has invalid totals.");
      }

      const exchangeDiscount = exchangeContext ? (Number(exchangeContext.oldTotal) || 0) : 0;
      const finalPayable = Math.max(0, Number(cartTotal) - exchangeDiscount);

      // Direct mock verification if exchange covers the full cost
      if (finalPayable <= 0 && exchangeContext) {
        const mockVerifyRes = await axios.post('/api/payment/verify-payment', {
          razorpay_order_id: "order_exchange_" + Date.now(),
          razorpay_payment_id: "pay_exchange_" + Date.now(),
          razorpay_signature: "mock_signature",
          orderDetails: {
            user: userEmail || shippingData.email,
            items: cartItems.map(item => ({
              product: item._id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image || item.images?.[0] || ''
            })),
            totalAmount: finalPayable,
            shippingAddress: { ...shippingData }
          }
        });

        if (mockVerifyRes.status === 200) {
          await axios.put(`/api/orders/${exchangeContext.oldOrderId}`, { status: "Replacement Completed" });
          localStorage.removeItem('exchangeContext');
          setOrderComplete(true);
          setNewOrderId(mockVerifyRes.data.orderId);
          clearCart();
          return;
        }
      }

      const resRzp = await loadRazorpay();
      if (!resRzp) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        setLoading(false);
        return;
      }

      // 0. Fetch Razorpay Key ID
      const { data: keyData } = await axios.get('/api/payment/get-key');

      // 1. Create order on server
      const { data: order } = await axios.post('/api/payment/create-order', {
        amount: finalPayable,
        receipt: `receipt_${Date.now()}`,
        orderDetails: {
          user: userEmail || shippingData.email,
          items: cartItems.map(it => ({
            product: it._id,
            name: it.name,
            price: it.dealerPrice || it.price,
            quantity: it.quantity,
            image: it.image
          })),
          totalAmount: cartTotal,
          shippingAddress: {
            name: `${shippingData.firstName} ${shippingData.lastName}`,
            address: shippingData.address,
            city: shippingData.city,
            zip: shippingData.zip || shippingData.pincode,
            phone: shippingData.phone
          }
        }
      });

      // 2. Handle Mock Order (if keys are missing)
      if (order.mock) {
        const mockVerifyRes = await axios.post('/api/payment/verify-payment', {
          razorpay_order_id: order.id,
          razorpay_payment_id: "pay_mock_" + Date.now(),
          razorpay_signature: "mock_signature",
          orderDetails: {
            user: shippingData.email,
            items: cartItems.map(item => ({
              product: item._id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image || item.images?.[0] || ''
            })),
            totalAmount: cartTotal,
            shippingAddress: { ...shippingData }
          }
        });

        if (mockVerifyRes.status === 200) {
          if (exchangeContext) {
            await axios.put(`/api/orders/${exchangeContext.oldOrderId}`, { status: "Replacement Completed" });
            localStorage.removeItem('exchangeContext');
          }
          setOrderComplete(true);
          setNewOrderId(mockVerifyRes.data.orderId);
          clearCart();
          return;
        }
      }

      // 3. Options for Real Razorpay
      const options = {
        key: keyData.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Cromsen Importers',
        description: 'Luxury Blinds & Curtains',
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post('/api/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                user: shippingData.email,
                items: cartItems.map(item => ({
                  product: item._id,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  image: item.image || item.images?.[0] || ''
                })),
                totalAmount: cartTotal,
                shippingAddress: { ...shippingData }
              }
            });

            if (verifyRes.data.message === 'Payment verified successfully') {
              if (exchangeContext) {
                 await axios.put(`/api/orders/${exchangeContext.oldOrderId}`, { status: "Replacement Completed" });
                 localStorage.removeItem('exchangeContext');
              }
              setOrderComplete(true);
              setNewOrderId(verifyRes.data.orderId);
              clearCart();
            }
          } catch (error) {
            console.error('Payment Verification Failed:', error);
            alert(`Payment verification failed: ${error.response?.data?.message || error.message}`);
          }
        },
        prefill: {
          name: `${shippingData.firstName} ${shippingData.lastName}`,
          email: shippingData.email,
          contact: shippingData.phone,
        },
        theme: { color: '#162d3a' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error starting payment:', error);
      alert(`Payment Initialization Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen pt-40 pb-20 flex flex-col items-center bg-white text-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-4xl font-serif text-primary mb-4 font-bold">Order Confirmed!</h2>
        <p className="text-gray-500 mb-2 max-w-sm font-sans">Thank you for your purchase. Your order has been received.</p>
        <p className="text-action font-bold mb-8">Order ID: #{newOrderId.slice(-8).toUpperCase()}</p>
        <Link to="/shop" className="bg-primary text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-action transition-all shadow-xl">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 font-sans">
      <div className="container mx-auto max-w-[1200px] px-5">
        <div className="flex items-center gap-2 mb-8 text-gray-400 hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          <Link to="/cart" className="text-xs uppercase tracking-widest font-bold">Back to Cart</Link>
        </div>

        <h1 className="text-4xl font-serif mb-12 text-primary font-bold">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Shipping Info */}
          <div className="lg:col-span-7">
            {/* Address Selection Section */}
            <div className="bg-white p-8 md:p-10 shadow-sm border border-gray-100 rounded-xl mb-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-serif text-primary flex items-center gap-2 font-bold">
                  <MapPin size={24} className="text-action" /> Select Shipping Address
                </h2>
                <button 
                  onClick={() => handleOpenModal()}
                  className="text-action text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Plus size={16} /> Add New
                </button>
              </div>

              {fetchingAddresses ? (
                <div className="flex items-center justify-center py-10">
                   <Loader2 size={24} className="animate-spin text-gray-300" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => (
                    <div 
                      key={addr._id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-action bg-action/5 shadow-md' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                      {selectedAddressId === addr._id && (
                        <div className="absolute top-4 right-4 text-action bg-white rounded-full p-1 shadow-sm">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      <p className="font-bold text-gray-900 mb-1">{addr.name}</p>
                      <p className="text-sm text-gray-500 leading-relaxed mb-3">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                      <p className="text-xs text-gray-400 font-medium">Phone: {addr.phone}</p>
                      
                      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(addr); }}
                          className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-action transition-colors flex items-center gap-1"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={(e) => handleDeleteAddress(e, addr._id)}
                          className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {savedAddresses.length === 0 && (
                    <div className="md:col-span-2 py-10 text-center border-2 border-dashed border-gray-100 rounded-xl">
                      <p className="text-gray-400 text-sm">No saved addresses found.</p>
                      <button onClick={() => handleOpenModal()} className="mt-2 text-action font-bold uppercase text-[10px] tracking-widest">Create First Address</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Read-only Preview of selected info or Manual Form */}
            <div className="bg-white p-8 md:p-10 shadow-sm border border-gray-100 rounded-xl">
              <h2 className="text-xl font-serif text-primary mb-8 flex items-center gap-2 font-bold">
                <Truck size={24} className="text-action" /> Confirm Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">First Name</label>
                  <input required name="firstName" value={shippingData.firstName} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Last Name</label>
                  <input required name="lastName" value={shippingData.lastName} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Email Address</label>
                  <input required name="email" value={shippingData.email} onChange={handleInputChange} type="email" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Phone Number</label>
                  <input required name="phone" value={shippingData.phone} onChange={handleInputChange} type="tel" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Street Address</label>
                  <input required name="address" value={shippingData.address} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">City</label>
                  <input required name="city" value={shippingData.city} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Pincode / Zip</label>
                  <input required name="zip" value={shippingData.zip || shippingData.pincode} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent font-medium" />
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Payment */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 md:p-10 shadow-xl border border-gray-100 rounded-2xl sticky top-32">
              <h2 className="text-xl font-serif text-primary mb-8 flex items-center gap-2 font-bold border-b border-gray-50 pb-4">Order Summary</h2>

              <div className="max-h-60 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center relative">
                      {getImageUrl(item.image || item.images?.[0]) ? (
                        <img src={getImageUrl(item.image || item.images?.[0])} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={20} className="text-gray-200" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-serif text-primary font-bold line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-10 text-sm border-t border-gray-50 pt-6">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-primary font-bold">₹{(Number(cartTotal) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
                </div>
                {exchangeContext && (
                  <div className="flex justify-between text-gray-500 bg-blue-50/50 p-2 rounded -mx-2">
                    <span className="text-blue-700">Exchange Credit <br/><span className="text-[10px] text-blue-500 uppercase">Order #{exchangeContext.oldOrderId.slice(-8)}</span></span>
                    <span className="font-bold text-blue-700">-₹{(Number(exchangeContext.oldTotal) || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center mt-6">
                  <span className="text-xl font-serif text-primary font-bold">Total Payable</span>
                  <span className="text-2xl font-bold text-action tracking-tight">₹{Math.max(0, (Number(cartTotal) || 0) - (exchangeContext ? (Number(exchangeContext.oldTotal) || 0) : 0)).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading}
                className={`w-full bg-primary text-white py-5 rounded-xl text-sm font-bold uppercase tracking-[0.2em] hover:bg-action transition-all shadow-xl flex items-center justify-center gap-3 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <> <CreditCard size={18} /> Pay Now via Razorpay </>}
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
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-serif font-bold text-primary">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveAddress} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Full Name</label>
                  <input required name="name" value={addressForm.name} onChange={handleFormInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors text-sm font-medium" placeholder="Recipient Name" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Street Address</label>
                  <input required name="street" value={addressForm.street} onChange={handleFormInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors text-sm font-medium" placeholder="Street, Building, Area" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">City</label>
                    <input required name="city" value={addressForm.city} onChange={handleFormInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">State</label>
                    <input required name="state" value={addressForm.state} onChange={handleFormInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors text-sm font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Pincode</label>
                    <input required name="zip" value={addressForm.zip} onChange={handleFormInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Phone Number</label>
                    <input required name="phone" value={addressForm.phone} onChange={handleFormInputChange} type="tel" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors text-sm font-medium" />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" name="isDefault" id="isDefault" checked={addressForm.isDefault} onChange={handleFormInputChange} className="w-4 h-4 text-action accent-action" />
                  <label htmlFor="isDefault" className="text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer">Set as default address</label>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-action transition-all shadow-xl mt-4 flex items-center justify-center"
                >
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
