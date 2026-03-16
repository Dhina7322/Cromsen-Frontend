import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post('/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('userRole', data.role);
      navigate('/');
      window.location.reload(); // Refresh to update navbar
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 md:p-12 shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-brand font-bold text-center mb-8 uppercase tracking-widest text-primary">Register</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Full Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-action transition-colors text-sm"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Email</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-action transition-colors text-sm"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Password</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-action transition-colors text-sm"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-action transition-colors text-sm"
              placeholder="Confirm your password"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-action transition-all shadow-md mt-4"
          >
            Create Account
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-sans">
            Already have an account?{' '}
            <Link to="/login" className="text-action hover:text-primary transition-colors font-bold underline underline-offset-4">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
