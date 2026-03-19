import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingCart, User, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getProducts, getCategories } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const searchRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const userRole = localStorage.getItem('userRole') || 'customer';

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // Fetch products and categories for the search dropdown
    getProducts({ limit: 1000 }).then(res => {
      const p = res?.products || res;
      setProducts(Array.isArray(p) ? p : []);
    }).catch(console.error);
    
    getCategories().then(res => {
      const c = res?.categories || res;
      setCategories(Array.isArray(c) ? c : []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      setFilteredSuggestions({
        products: products.filter(p => p.name?.toLowerCase().includes(q)).slice(0, 5),
        categories: categories.filter(c => c.name?.toLowerCase().includes(q)).slice(0, 3),
      });
      setShowCategoryDropdown(false);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions({ products: [], categories: [] });
      if (document.activeElement === searchRef.current?.querySelector('input')) {
        setShowCategoryDropdown(true);
      }
    }
  }, [searchQuery, products, categories]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setShowCategoryDropdown(false);
    }
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
            <img src="../../assets/logo.png" alt="Cromsen Importers" className="h-8 lg:h-10 w-auto object-contain brightness-0 invert" />
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
            <div className="relative flex items-center" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim().length === 0) {
                      setShowCategoryDropdown(true);
                      setShowSuggestions(false);
                    } else {
                      setShowSuggestions(true);
                    }
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white rounded-full py-2 pl-4 pr-10 text-[11px] w-56 lg:w-64 focus:outline-none focus:border-action transition-all placeholder:text-gray-400 normal-case tracking-normal focus:bg-white/20"
                />
                <button type="submit" className="absolute right-3 text-gray-300 hover:text-white transition-colors">
                  <Search size={16} />
                </button>
              </form>

              <AnimatePresence>
                {/* 1. Browse Categories Dropdown (When empty) */}
                {showCategoryDropdown && !showSuggestions && categories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 w-80 mt-3 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden z-[60] border border-gray-100 font-sans tracking-normal normal-case"
                  >
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                      <Search size={14} /> Browse Categories
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3">
                      {categories.slice(0, 6).map((c) => (
                        <div 
                          key={c._id} 
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => { navigate(`/shop?category=${c.name?.toLowerCase().replace(/[\s_]+/g, '-')}`); setShowCategoryDropdown(false); }}
                        >
                          <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                             {getImageUrl(c.image) ? (
                                <>
                                  <img 
                                    src={getImageUrl(c.image)} 
                                    alt={c.name} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.target.style.display='none'; if(e.target.nextElementSibling) e.target.nextElementSibling.style.display='flex'; }}
                                  />
                                  <div className="w-full h-full items-center justify-center text-xs font-bold text-gray-400 hidden absolute inset-0 bg-gray-100">{c.name?.charAt(0)}</div>
                                </>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{c.name?.charAt(0)}</div>
                             )}
                          </div>
                          <span className="text-sm font-medium line-clamp-2">{c.name}</span>
                        </div>
                      ))}
                    </div>
                    <div 
                      className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-action cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => { navigate('/shop'); setShowCategoryDropdown(false); }}
                    >
                      <Search size={14} /> View all categories
                    </div>
                  </motion.div>
                )}

                {/* 2. Search Suggestions Dropdown (When typing) */}
                {showSuggestions && (filteredSuggestions.products.length > 0 || filteredSuggestions.categories.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 w-96 mt-3 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden z-[60] border border-gray-100 max-h-[80vh] flex flex-col font-sans tracking-normal normal-case"
                  >
                    <div className="overflow-y-auto custom-scrollbar">
                      {filteredSuggestions.categories.length > 0 && (
                        <div className="border-b border-gray-100 p-2">
                          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-3 py-2">Categories</div>
                          {filteredSuggestions.categories.map((c) => (
                            <div 
                              key={c._id}
                              onClick={() => { navigate(`/shop?category=${c.name?.toLowerCase().replace(/[\s_]+/g, '-')}`); setSearchQuery(""); setShowSuggestions(false); }}
                              className="flex items-center gap-4 p-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                {getImageUrl(c.image) ? (
                                  <>
                                    <img 
                                      src={getImageUrl(c.image)} 
                                      alt={c.name} 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => { e.target.style.display='none'; if(e.target.nextElementSibling) e.target.nextElementSibling.style.display='flex'; }}
                                    />
                                    <div className="w-full h-full items-center justify-center text-xs font-bold text-gray-400 hidden absolute inset-0 bg-gray-100">{c.name?.charAt(0)}</div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{c.name?.charAt(0)}</div>
                                )}
                              </div>
                              <div className="flex-grow">
                                <div className="text-sm font-medium text-primary">{c.name}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">in Categories</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {filteredSuggestions.products.length > 0 && (
                        <div className="p-2">
                          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-3 py-2">Products</div>
                          {filteredSuggestions.products.map((p) => {
                            const oos = p.stock <= 0;
                            return (
                              <div 
                                key={p._id}
                                onClick={() => { navigate(`/product/${p._id}`); setSearchQuery(""); setShowSuggestions(false); }}
                                className="flex items-center gap-4 p-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                  {getImageUrl(p.image || p.images?.[0]) ? (
                                    <img src={getImageUrl(p.image || p.images?.[0])} alt={p.name} className={`w-full h-full object-cover ${oos ? 'opacity-40' : ''}`} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400">{p.name.charAt(0)}</div>
                                  )}
                                </div>
                                <div className="flex-grow pr-2">
                                  <div className="text-sm font-medium text-primary line-clamp-1 truncate" style={{ opacity: oos ? 0.6 : 1 }}>{p.name}</div>
                                  <div className="text-xs font-bold mt-1" style={{ color: oos ? '#ef4444' : '#d4960a' }}>
                                    {oos ? 'Out of Stock' : `₹${p.price}`}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-action cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
                      onClick={handleSearchSubmit}
                    >
                      <span className="flex items-center gap-2"><Search size={14} /> View all results for "{searchQuery}"</span>
                      <span className="text-xl leading-none">→</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {userRole === 'admin' && (
              <Link to="/admin" className="text-action hover:text-white transition-colors flex items-center gap-1">
                <Shield size={14} /> Admin
              </Link>
            )}
            
            {/* <div className="flex flex-col items-center">
               <span className="text-[8px] opacity-40 leading-none">Price Tier:</span>
               <button 
                 onClick={() => { localStorage.removeItem('userRole'); window.location.reload(); }}
                 className="text-[9px] text-accent tracking-[0.2em] hover:text-white transition-colors flex items-center gap-1"
               >
                 {userRole === 'dealer' ? 'Dealer' : userRole === 'admin' ? 'Admin' : 'Retail'} <RefreshCw size={8} />
               </button>
            </div> */}

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
                      
                      <div className="absolute top-full right-0 pt-2 w-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0">
                        <div className="bg-primary border border-white/10 rounded-lg shadow-xl py-2">
                          <Link
                            to="/my-orders"
                            className="w-full block text-left px-4 py-2 text-[10px] text-gray-300 hover:text-white hover:bg-white/5"
                          >
                            My Orders
                          </Link>
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
              <div className="relative" ref={searchRef}>
                <form onSubmit={(e) => { handleSearchSubmit(e); setIsOpen(false); }} className="relative flex items-center w-full">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onFocus={() => {
                      if (searchQuery.trim().length === 0) {
                        setShowCategoryDropdown(true);
                        setShowSuggestions(false);
                      } else {
                        setShowSuggestions(true);
                      }
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded py-2 pl-4 pr-10 text-sm w-full focus:outline-none focus:border-action transition-colors placeholder:text-gray-400 normal-case tracking-normal"
                  />
                  <button type="submit" className="absolute right-3 text-gray-300 hover:text-white transition-colors">
                    <Search size={18} />
                  </button>
                </form>

                <AnimatePresence>
                  {/* 1. Mobile Browse Categories Dropdown (When empty) */}
                  {showCategoryDropdown && !showSuggestions && categories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden z-[60] border border-gray-100 font-sans tracking-normal normal-case"
                    >
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                        <Search size={14} /> Browse Categories
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-3">
                        {categories.slice(0, 4).map((c) => (
                          <div 
                            key={c._id} 
                            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-center"
                            onClick={() => { navigate(`/shop?category=${c.name?.toLowerCase().replace(/[\s_]+/g, '-')}`); setShowCategoryDropdown(false); setIsOpen(false); }}
                          >
                            <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                               {getImageUrl(c.image) ? (
                                  <>
                                    <img 
                                      src={getImageUrl(c.image)} 
                                      alt={c.name} 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => { e.target.style.display='none'; if(e.target.nextElementSibling) e.target.nextElementSibling.style.display='flex'; }}
                                    />
                                    <div className="w-full h-full items-center justify-center text-xs font-bold text-gray-400 hidden absolute inset-0 bg-gray-100">{c.name?.charAt(0)}</div>
                                  </>
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{c.name?.charAt(0)}</div>
                               )}
                            </div>
                            <span className="text-xs font-medium line-clamp-1">{c.name}</span>
                          </div>
                        ))}
                      </div>
                      <div 
                        className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-action cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => { navigate('/shop'); setShowCategoryDropdown(false); setIsOpen(false); }}
                      >
                        <Search size={14} /> View all categories
                      </div>
                    </motion.div>
                  )}

                  {/* 2. Mobile Search Suggestions Dropdown (When typing) */}
                  {showSuggestions && (filteredSuggestions.products.length > 0 || filteredSuggestions.categories.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden z-[60] border border-gray-100 max-h-[60vh] flex flex-col font-sans tracking-normal normal-case"
                    >
                      <div className="overflow-y-auto custom-scrollbar">
                        {filteredSuggestions.categories.length > 0 && (
                          <div className="border-b border-gray-100 p-2">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-3 py-2">Categories</div>
                            {filteredSuggestions.categories.map((c) => (
                              <div 
                                key={c._id}
                                onClick={() => { navigate(`/shop?category=${c.name?.toLowerCase().replace(/[\s_]+/g, '-')}`); setSearchQuery(""); setShowSuggestions(false); setIsOpen(false); }}
                                className="flex items-center gap-4 p-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                  {getImageUrl(c.image) ? (
                                    <>
                                      <img 
                                        src={getImageUrl(c.image)} 
                                        alt={c.name} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { e.target.style.display='none'; if(e.target.nextElementSibling) e.target.nextElementSibling.style.display='flex'; }}
                                      />
                                      <div className="w-full h-full items-center justify-center text-xs font-bold text-gray-400 hidden absolute inset-0 bg-gray-100">{c.name?.charAt(0)}</div>
                                    </>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{c.name?.charAt(0)}</div>
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <div className="text-sm font-medium text-primary">{c.name}</div>
                                  <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">in Categories</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {filteredSuggestions.products.length > 0 && (
                          <div className="p-2">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-3 py-2">Products</div>
                            {filteredSuggestions.products.map((p) => {
                              const oos = p.stock <= 0;
                              return (
                                <div 
                                  key={p._id}
                                  onClick={() => { navigate(`/product/${p._id}`); setSearchQuery(""); setShowSuggestions(false); setIsOpen(false); }}
                                  className="flex items-center gap-4 p-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                  <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                    {getImageUrl(p.image || p.images?.[0]) ? (
                                      <>
                                        <img 
                                          src={getImageUrl(p.image || p.images?.[0])} 
                                          alt={p.name} 
                                          className={`w-full h-full object-cover ${oos ? 'opacity-40' : ''}`} 
                                          onError={(e) => { e.target.style.display='none'; if(e.target.nextElementSibling) e.target.nextElementSibling.style.display='flex'; }}
                                        />
                                        <div className="w-full h-full items-center justify-center text-sm font-bold text-gray-400 hidden absolute inset-0 bg-gray-100">{p.name?.charAt(0)}</div>
                                      </>
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400">{p.name?.charAt(0)}</div>
                                    )}
                                  </div>
                                  <div className="flex-grow pr-2">
                                    <div className="text-sm font-medium text-primary line-clamp-1 truncate" style={{ opacity: oos ? 0.6 : 1 }}>{p.name}</div>
                                    <div className="text-xs font-bold mt-1" style={{ color: oos ? '#ef4444' : '#d4960a' }}>
                                      {oos ? 'Out of Stock' : `₹${p.price}`}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      <div 
                        className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-action cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
                        onClick={(e) => { handleSearchSubmit(e); setIsOpen(false); }}
                      >
                        <span className="flex items-center gap-2"><Search size={14} /> View all results for "{searchQuery}"</span>
                        <span className="text-xl leading-none">→</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
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
                      <Link to="/my-orders" onClick={() => setIsOpen(false)} className="text-left text-sm uppercase tracking-widest font-medium text-gray-300 hover:text-white">
                        My Orders
                      </Link>
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
