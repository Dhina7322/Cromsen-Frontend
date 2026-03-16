import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingCart, User, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const userRole = localStorage.getItem('userRole') || 'customer';

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const res = await fetch(`/api/products/search?q=${searchQuery}`);
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Suggestions error:', err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name) => {
    navigate(`/shop?search=${encodeURIComponent(name)}`);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const topOffset = isHomePage && !scrolled ? 50 : 0;

  return (
    <>
      <motion.nav
        className="fixed w-full z-50 left-0 bg-primary border-b border-white/10"
        animate={{ top: topOffset }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <div className="container mx-auto max-w-[1200px] px-5 flex items-center justify-between py-4">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-action" />
            </div>
            <span className="text-xs font-brand font-bold tracking-[0.18em] uppercase text-white leading-tight">
              Cromsen
            </span>
          </Link>

          {/* Center: Navigation Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[11px] uppercase tracking-widest font-sans transition-colors relative pb-1 ${isActive ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-action" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Search, Login, Register, Cart */}
          <div className="hidden lg:flex items-center space-x-6 text-white text-xs font-sans uppercase tracking-widest font-bold">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-full py-1.5 pl-4 pr-10 text-[10px] w-48 focus:outline-none focus:border-action transition-colors placeholder:text-gray-400 normal-case tracking-normal"
              />
              <button type="submit" className="absolute right-3 text-gray-300 hover:text-white transition-colors">
                <Search size={14} />
              </button>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-primary border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[60]"
                  >
                    {suggestions.map((name, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestionClick(name)}
                        className="w-full text-left px-4 py-2.5 text-[10px] text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0 lowercase tracking-wide"
                      >
                        {name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {userRole === 'admin' && (
              <Link to="/admin" className="text-action hover:text-white transition-colors flex items-center gap-1">
                <Shield size={14} /> Admin
              </Link>
            )}
            
            <div className="flex flex-col items-center">
               <span className="text-[8px] opacity-40 leading-none">Price Tier:</span>
               <button 
                 onClick={() => { localStorage.removeItem('userRole'); window.location.reload(); }}
                 className="text-[9px] text-accent tracking-[0.2em] hover:text-white transition-colors flex items-center gap-1"
               >
                 {userRole === 'dealer' ? 'Dealer' : userRole === 'admin' ? 'Admin' : 'Retail'} <RefreshCw size={8} />
               </button>
            </div>

            {localStorage.getItem('userInfo') ? (() => {
              try {
                const userObj = JSON.parse(localStorage.getItem('userInfo'));
                if (!userObj || !userObj.name) return <Link to="/login" className="hover:text-action transition-colors">Login</Link>;
                const firstName = userObj.name.split(' ')[0];
                return (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 group cursor-pointer relative">
                      <User size={16} className="text-action" />
                      <span className="text-white hover:text-action transition-colors capitalize">
                        {firstName}
                      </span>
                      
                      <div className="absolute top-full right-0 mt-2 w-32 bg-primary border border-white/10 rounded-lg shadow-xl py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0">
                        <button 
                          onClick={() => {
                            localStorage.removeItem('userInfo');
                            localStorage.removeItem('userRole');
                            window.location.reload();
                          }}
                          className="w-full text-left px-4 py-2 text-[10px] text-gray-300 hover:text-white hover:bg-white/5"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } catch (e) {
                return <Link to="/login" className="hover:text-action transition-colors">Login</Link>;
              }
            })() : (
              <Link to="/login" className="hover:text-action transition-colors">Login</Link>
            )}
            
            <span className="text-white/30">|</span>
            <Link to="/cart" className="flex items-center space-x-1 hover:text-action transition-colors relative">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-action text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile hamburger & cart */}
          <div className="lg:hidden flex items-center space-x-4">
            <Link to="/cart" className="text-white flex items-center relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-action text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed left-0 w-full z-40 bg-primary border-t border-white/10 shadow-lg"
            style={{ top: topOffset + 60 }}
          >
            <div className="flex flex-col p-6 space-y-6">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white rounded py-2 pl-4 pr-10 text-sm w-full focus:outline-none focus:border-action transition-colors placeholder:text-gray-400"
                />
                <button type="submit" className="absolute right-3 text-gray-300 hover:text-white transition-colors">
                  <Search size={18} />
                </button>

                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-primary border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[60]"
                    >
                      {suggestions.map((name, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            handleSuggestionClick(name);
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                        >
                          {name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
              
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm uppercase tracking-widest font-medium ${location.pathname === link.path ? 'text-action' : 'text-gray-300 hover:text-white'}`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-white/10 pt-4 flex flex-col space-y-4">
                  {localStorage.getItem('userInfo') ? (
                    <>
                      <div className="flex items-center space-x-2 text-action px-1">
                        <User size={16} />
                        <span className="text-sm uppercase tracking-widest font-medium">
                          {JSON.parse(localStorage.getItem('userInfo')).name}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('userInfo');
                          localStorage.removeItem('userRole');
                          window.location.reload();
                        }}
                        className="text-left text-sm uppercase tracking-widest font-medium text-gray-300 hover:text-white"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)} className="text-sm uppercase tracking-widest font-medium text-gray-300 hover:text-white">Login</Link>
                      <Link to="/register" onClick={() => setIsOpen(false)} className="text-sm uppercase tracking-widest font-medium text-gray-300 hover:text-white">Register</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
