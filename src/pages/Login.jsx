import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';
import { Check, AlertCircle, Mail, Phone, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const isValidEmail = (v) => {
  if (!v) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/.test(v);
};

const phoneRegex = /^[0-9]{10,15}$/;

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    const savedId = localStorage.getItem('rememberedId');
    const savedMethod = localStorage.getItem('rememberedMethod');
    if (savedId && savedMethod) {
      setLoginMethod(savedMethod);
      if (savedMethod === 'email') setEmail(savedId);
      else setPhone(savedId);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const identifier = loginMethod === 'email' ? email : phone;
    const valid = loginMethod === 'email' ? isValidEmail(email) : phoneRegex.test(phone);

    if (!valid) {
      return setFeedback({ 
        show: true, 
        type: 'error', 
        message: loginMethod === 'email' ? 'Please enter a valid email address.' : 'Please enter a valid 10-15 digit phone number.'
      });
    }

    const API = import.meta.env.VITE_API_URL || "/api";
    setLoading(true);
    try {
      const requiredRole = localStorage.getItem('userRole') || 'customer';
      const { data } = await axios.post(`${API}/users/login`, { email: identifier, password, requiredRole });
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('userRole', data.role);
      
      if (rememberMe) {
        localStorage.setItem('rememberedId', identifier);
        localStorage.setItem('rememberedMethod', loginMethod);
      } else {
        localStorage.removeItem('rememberedId');
        localStorage.removeItem('rememberedMethod');
      }

      // FIX: Tell Navbar to re-read userInfo (including avatar) immediately
      window.dispatchEvent(new Event('avatar-updated'));

      setFeedback({
        show: true,
        type: 'success',
        message: 'Login successful! Redirecting...'
      });

      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1500);

    } catch (err) {
      setFeedback({
        show: true,
        type: 'error',
        message: err.response?.data?.message || 'Login failed. Please check your credentials.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPortal = () => {
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const isEmailValid = isValidEmail(email);
  const isPhoneValid = phoneRegex.test(phone);

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 md:p-12 shadow-xl w-full max-w-md border border-gray-100 rounded-3xl">

        {/* Back to Portal Button */}
        <button
          onClick={handleBackToPortal}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Portal Select
        </button>

        <h2 className="text-3xl font-brand font-bold text-center mb-8 uppercase tracking-widest text-primary">Login</h2>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-50 p-1 rounded-2xl mb-8 relative">
          <button 
            onClick={() => setLoginMethod('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all z-10 ${loginMethod === 'email' ? 'text-primary' : 'text-gray-400'}`}
          >
            <Mail size={14} /> Email
          </button>
          <button 
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all z-10 ${loginMethod === 'phone' ? 'text-primary' : 'text-gray-400'}`}
          >
            <Phone size={14} /> Phone
          </button>
          <motion.div 
            className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm"
            style={{ width: 'calc(50% - 4px)' }}
            animate={{ x: loginMethod === 'email' ? 0 : '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <AnimatePresence mode="wait">
            {loginMethod === 'email' ? (
              <motion.div 
                key="email-field"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
              >
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Email Address</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className={`w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 transition-all text-sm font-semibold outline-none ${
                        email ? (isEmailValid ? 'focus:ring-green-500' : 'focus:ring-red-400') : 'focus:ring-primary'
                    }`}
                    placeholder="Enter your email"
                  />
                  {email && (
                    <span className="absolute right-5 top-1/2 -translate-y-1/2">
                      {isEmailValid ? <Check size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-400" />}
                    </span>
                  )}
                </div>
                {email && !isEmailValid && (
                  <p className="text-[10px] text-red-400 mt-2 ml-1 font-bold uppercase tracking-wider">Invalid email format</p>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="phone-field"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
              >
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Phone Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 15))}
                    className={`w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 transition-all text-sm font-semibold outline-none ${
                        phone ? (isPhoneValid ? 'focus:ring-green-500' : 'focus:ring-red-400') : 'focus:ring-primary'
                    }`}
                    placeholder="Enter 10-15 digit phone"
                  />
                  {phone && (
                    <span className="absolute right-5 top-1/2 -translate-y-1/2">
                      {isPhoneValid ? <Check size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-400" />}
                    </span>
                  )}
                </div>
                {phone && !isPhoneValid && (
                  <p className="text-[10px] text-red-400 mt-2 ml-1 font-bold uppercase tracking-wider">Must be 10-15 digits</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-semibold outline-none"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer appearance-none w-5 h-5 bg-gray-50 border-2 border-gray-200 rounded-lg checked:bg-primary checked:border-primary transition-all cursor-pointer"
                />
                <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-primary transition-colors">Remember Me</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs">
          <p className="text-gray-500 font-bold uppercase tracking-widest">
            Don't have an account?{' '}
            <Link to="/register" className="text-action hover:text-black transition-colors font-bold underline underline-offset-8">
              Register here
            </Link>
          </p>
        </div>
      </div>

      <FeedbackModal 
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ ...feedback, show: false })}
      />
    </div>
  );
};

export default Login;