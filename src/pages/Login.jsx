import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 md:p-12 shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-brand font-bold text-center mb-8 uppercase tracking-widest text-primary">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-action transition-colors text-sm"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-action transition-colors text-sm"
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-action transition-all shadow-md mt-4"
          >
            Sign In
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-sans">
            Don't have an account?{' '}
            <Link to="/register" className="text-action hover:text-primary transition-colors font-bold underline underline-offset-4">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
