import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ArrowRight, ImageIcon, LogIn, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/imageUtils';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      setShowLoginPrompt(true);
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-40 pb-20 flex flex-col items-center bg-gray-50 text-center px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-serif text-primary mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          to="/shop" 
          className="bg-primary text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-action transition-colors shadow-md flex items-center gap-2"
        >
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto max-w-[1200px] px-5">
        <h1 className="text-4xl font-serif mb-12 text-primary font-bold">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {cartItems.map((item) => (
              <div key={`${item._id}-${item.selectedVariant}`} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 border-b border-gray-100 bg-white p-4 md:p-0 md:bg-transparent shadow-sm md:shadow-none rounded-lg md:rounded-none">
                <div className="col-span-1 md:col-span-6 flex items-center space-x-6">
                  <Link to={`/product/${item.slug || item._id}`} className="shrink-0 w-24 h-24 overflow-hidden rounded bg-gray-100 block border border-gray-200 relative">
                    {getImageUrl(item.image || item.images?.[0]) ? (
                      <>
                        <img 
                          src={getImageUrl(item.image || item.images?.[0])} 
                          alt={item.name} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full flex-col items-center justify-center text-gray-300 transition-transform duration-500 hover:scale-110 hidden absolute inset-0 bg-gray-100">
                          <ImageIcon size={28} className="opacity-50" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 transition-transform duration-500 hover:scale-110">
                        <ImageIcon size={28} className="opacity-50" />
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-accent uppercase tracking-widest font-bold mb-1">
                      {Array.isArray(item.category) 
                        ? (item.category[0]?.name || item.category[0] || 'Product') 
                        : (item.category?.name || item.category || 'Product')}
                    </span>
                    <Link to={`/product/${item.slug || item._id}`} className="text-lg font-serif text-primary hover:text-action transition-colors mb-1">
                      {item.name || 'Untitled Product'}
                    </Link>
                    {item.selectedVariant && (
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 bg-gray-50 self-start px-2 py-1 border border-gray-100 rounded-sm">
                        Variant: {item.selectedVariant}
                      </span>
                    )}
                    {item.customColor && (
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 bg-gray-50 self-start px-2 py-1 border border-gray-100 rounded-sm">
                        Color: {item.customColor}
                      </span>
                    )}
                    <button 
                      onClick={() => removeFromCart(item._id, item.selectedVariant, item.customColor, item.customDimensions)}
                      className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors self-start underline underline-offset-4"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>

                {/* Price (Desktop) */}
                <div className="hidden md:block col-span-2 text-center text-sm font-sans tracking-tight">
                  ₹{(Number(item.price) || 0).toFixed(2)}
                </div>

                {/* Quantity */}
                <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center">
                  <div className="md:hidden text-xs font-bold uppercase text-gray-500">Quantity</div>
                  <div className="flex items-center border border-gray-200 bg-white">
                    <button 
                      onClick={() => updateQuantity(item._id, item.selectedVariant, item.customColor, item.customDimensions, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.selectedVariant, item.customColor, item.customDimensions, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center font-bold">
                  <div className="md:hidden text-xs font-bold uppercase text-gray-500">Total</div>
                  <div className="text-action text-lg tracking-tight">
                    ₹{((Number(item.price) || 0) * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Header */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 border border-gray-100 shadow-xl sticky top-32">
              <h3 className="text-xl font-serif text-primary mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-8 text-sm text-gray-600 font-sans">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-primary">₹{(Number(cartTotal) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-gray-400 italic">Calculated at checkout</span>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xl font-serif text-primary font-bold">Total</span>
                  <span className="text-2xl font-bold text-action tracking-tight shadow-sm">₹{(Number(cartTotal) || 0).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckoutClick}
                className="w-full bg-primary text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-action transition-all shadow-md flex items-center justify-center gap-2 mb-4 group"
              >
                Checkout Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                Taxes and discounts applied at checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginPrompt(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative z-10 text-center border border-gray-100"
            >
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 bg-action/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn size={32} className="text-action" />
              </div>

              <h3 className="text-2xl font-serif text-primary mb-4 font-bold">Login Required</h3>
              <p className="text-gray-500 mb-8 leading-relaxed font-sans">
                Please sign in to your account to place an order and enjoy a seamless checkout experience.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-action transition-all shadow-md"
                >
                  Login Now
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full bg-white text-primary border border-gray-200 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all font-sans"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
