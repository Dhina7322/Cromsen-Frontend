import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';
import { Check, AlertCircle } from 'lucide-react';

const isValidEmail = (v) => {
  if (!v) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/.test(v);
};

const phoneRegex = /^[0-9]{10,15}$/;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: 'success', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 15);
    }
    if (name === 'email') {
      value = value.trim().replace(/[^a-zA-Z0-9@._-]/g, '');
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword) {
      setFeedback({ show: true, type: 'error', message: "Passwords don't match!" });
      return;
    }

    if (!isValidEmail(formData.email)) {
      return setFeedback({ show: true, type: 'error', message: 'Please enter a valid email address.' });
    }
    if (!phoneRegex.test(formData.phone)) {
      return setFeedback({ show: true, type: 'error', message: 'Phone number must be 10-15 digits only.' });
    }
    
    setLoading(true);
    try {
      const role = localStorage.getItem('userRole') || 'customer';
      await axios.post('/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role
      });
      
      setFeedback({ 
        show: true, 
        type: 'success', 
        message: 'Registration successful! Please login with your credentials.' 
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setFeedback({ 
        show: true, 
        type: 'error', 
        message: err.response?.data?.message || 'Registration failed. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = isValidEmail(formData.email);
  const isPhoneValid = phoneRegex.test(formData.phone);

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 md:p-12 shadow-xl w-full max-w-md border border-gray-100 rounded-3xl">
        <h2 className="text-3xl font-brand font-bold text-center mb-8 uppercase tracking-widest text-primary">Register</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-semibold outline-none"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Email</label>
            <div className="relative">
              <input 
                type="text" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 transition-all text-sm font-semibold outline-none ${
                   formData.email ? (isEmailValid ? 'focus:ring-green-500' : 'focus:ring-red-400') : 'focus:ring-primary'
                }`}
                placeholder="Enter your email"
              />
              {formData.email && (
                <span className="absolute right-5 top-1/2 -translate-y-1/2">
                  {isEmailValid ? <Check size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-400" />}
                </span>
              )}
            </div>
            {formData.email && !isEmailValid && (
              <p className="text-[10px] text-red-400 mt-2 ml-1 font-bold uppercase tracking-wider">Invalid email format</p>
            )}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Phone Number</label>
            <div className="relative">
              <input 
                type="tel" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className={`w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 transition-all text-sm font-semibold outline-none ${
                   formData.phone ? (isPhoneValid ? 'focus:ring-green-500' : 'focus:ring-red-400') : 'focus:ring-primary'
                }`}
                placeholder="10-15 digits only"
              />
              {formData.phone && (
                <span className="absolute right-5 top-1/2 -translate-y-1/2">
                  {isPhoneValid ? <Check size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-400" />}
                </span>
              )}
            </div>
            {formData.phone && !isPhoneValid && (
              <p className="text-[10px] text-red-400 mt-2 ml-1 font-bold uppercase tracking-wider">Must be 10-15 digits only</p>
            )}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Password</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-semibold outline-none"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-semibold outline-none"
              placeholder="Confirm your password"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 mt-4"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-8 text-center text-xs">
          <p className="text-gray-500 font-bold uppercase tracking-widest">
            Already have an account?{' '}
            <Link to="/login" className="text-action hover:text-black transition-colors font-bold underline underline-offset-8">
              Login here
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

export default Register;
