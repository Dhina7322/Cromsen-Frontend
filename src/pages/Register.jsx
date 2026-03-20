import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';

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
      value = value.replace(/[^a-zA-Z0-9@._-]/g, '');
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword) {
      setFeedback({ show: true, type: 'error', message: "Passwords don't match!" });
      return;
    }

    // Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!emailRegex.test(formData.email)) {
      return setFeedback({ show: true, type: 'error', message: 'Please enter a valid email address.' });
    }
    if (!phoneRegex.test(formData.phone)) {
      return setFeedback({ show: true, type: 'error', message: 'Phone number must be 10-15 digits only.' });
    }
    
    setLoading(true);
    try {
      const role = localStorage.getItem('userRole') || 'customer';
      const { data } = await axios.post('/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('userRole', data.role);
      navigate('/');
      window.location.reload(); // Refresh to update navbar
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
            <input 
              type="email" 
              name="email"
              required
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Please enter a valid email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-semibold outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-semibold outline-none"
              placeholder="10-15 digits only"
            />
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
