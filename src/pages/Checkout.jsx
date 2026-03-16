import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [newOrderId, setNewOrderId] = useState('');

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleInputChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
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
    e.preventDefault();
    setLoading(true);

    try {
      if (!cartTotal || cartTotal <= 0) {
        return alert("Your cart is empty or has invalid totals.");
      }

      // 0. Fetch Razorpay Key ID
      const { data: keyData } = await axios.get('/api/payment/get-key');

      // 1. Create order on server
      const { data: order } = await axios.post('/api/payment/create-order', {
        amount: cartTotal,
        receipt: `receipt_${Date.now()}`,
      });

      // 2. Handle Mock Order (if keys are missing)
      if (order.mock) {
        console.log('Using Mock Payment Mode');
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
              price: item.price
            })),
            totalAmount: cartTotal,
            shippingAddress: { ...shippingData }
          }
        });

        if (mockVerifyRes.status === 200) {
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
            // 4. Verify payment on server
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
                  price: item.price
                })),
                totalAmount: cartTotal,
                shippingAddress: {
                  ...shippingData
                }
              }
            });

            if (verifyRes.data.message === 'Payment verified successfully') {
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
        theme: {
          color: '#162d3a',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error starting payment:', error);
      const msg = error.response?.data?.message || error.message;
      alert(`Payment Initialization Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen pt-40 pb-20 flex flex-col items-center bg-white text-center px-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-4xl font-serif text-primary mb-4 font-bold">Order Confirmed!</h2>
        <p className="text-gray-500 mb-2 max-w-sm font-sans">Thank you for your purchase. Your order has been received.</p>
        <p className="text-action font-bold mb-8">Order ID: #{newOrderId.slice(-8).toUpperCase()}</p>
        <Link 
          to="/shop" 
          className="bg-primary text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-action transition-all shadow-xl"
        >
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

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Shipping Info */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-10 shadow-sm border border-gray-100 rounded-sm">
              <h2 className="text-xl font-serif text-primary mb-8 flex items-center gap-2 font-bold">
                <Truck size={24} className="text-action" /> Shipping Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">First Name</label>
                  <input required name="firstName" value={shippingData.firstName} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Last Name</label>
                  <input required name="lastName" value={shippingData.lastName} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Email Address</label>
                  <input required name="email" value={shippingData.email} onChange={handleInputChange} type="email" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Phone Number</label>
                  <input required name="phone" value={shippingData.phone} onChange={handleInputChange} type="tel" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Street Address</label>
                  <input required name="address" value={shippingData.address} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">City</label>
                  <input required name="city" value={shippingData.city} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">State / Province</label>
                  <input required name="state" value={shippingData.state} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-action transition-colors bg-transparent" />
                </div>
              </div>

              <div className="mt-12 p-6 bg-gray-50 rounded flex items-start gap-4">
                <ShieldCheck size={24} className="text-green-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Secure Transaction</p>
                  <p className="text-[11px] text-gray-500">Your connection is secure and your data is protected with industrial-grade encryption.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sumary & Payment */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 md:p-10 shadow-xl border border-gray-100 rounded-sm sticky top-32">
              <h2 className="text-xl font-serif text-primary mb-8 flex items-center gap-2 font-bold border-b border-gray-50 pb-4">
                Order Summary
              </h2>

              <div className="max-h-60 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                      <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
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
                  <span className="font-medium text-primary">₹{(Number(cartTotal) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center mt-6">
                  <span className="text-xl font-serif text-primary font-bold">Total Payable</span>
                  <span className="text-2xl font-bold text-action tracking-tight">₹{(Number(cartTotal) || 0).toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full bg-primary text-white py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-action transition-all shadow-xl flex items-center justify-center gap-3 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : (
                  <>
                    <CreditCard size={18} /> Pay Now via Razorpay
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
                <img src="https://cdn.razorpay.com/static/assets/logo/payment_method_visa.svg" className="h-4" alt="Visa" />
                <img src="https://cdn.razorpay.com/static/assets/logo/payment_method_mastercard.svg" className="h-4" alt="Mastercard" />
                <img src="https://cdn.razorpay.com/static/assets/logo/payment_method_upi.svg" className="h-6" alt="UPI" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
