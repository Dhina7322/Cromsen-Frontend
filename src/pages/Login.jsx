import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: 'success', message: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requiredRole = localStorage.getItem('userRole'); // 'customer' or 'dealer'
      const { data } = await axios.post('/api/users/login', { email, password, requiredRole });
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('userRole', data.role);
      navigate('/');
      window.location.reload(); // Refresh to update navbar
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

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 md:p-12 shadow-xl w-full max-w-md border border-gray-100 rounded-3xl">
        <h2 className="text-3xl font-brand font-bold text-center mb-8 uppercase tracking-widest text-primary">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-semibold outline-none"
              placeholder="Enter your email"
            />
          </div>
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
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 mt-4"
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
