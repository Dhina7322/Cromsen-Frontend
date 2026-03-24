import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Helper to get the per-user cart key
const getCartKey = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null') || JSON.parse(localStorage.getItem('user') || 'null');
    const email = userInfo?.email || 'guest';
    return `cart_${email}`;
  } catch {
    return 'cart_guest';
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const key = getCartKey();
      const savedCart = localStorage.getItem(key);
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Re-load cart when login/logout changes the user
  useEffect(() => {
    const handleStorageChange = () => {
      const key = getCartKey();
      try {
        const savedCart = localStorage.getItem(key);
        const parsed = savedCart ? JSON.parse(savedCart) : [];
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCartItems([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const key = getCartKey();
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems]);

  const [toasts, setToasts] = useState([]);

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const isSameItem = (a, b) => (
        a._id === b._id &&
        a.selectedVariant === b.selectedVariant &&
        a.customColor === b.customColor &&
        JSON.stringify(a.customDimensions || null) === JSON.stringify(b.customDimensions || null)
      );

      const existing = prev.find(item => isSameItem(item, product));
      if (existing) {
        return prev.map(item =>
          isSameItem(item, product)
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    addToast(`${product.name || 'Product'} added to cart!`);
  };

  const removeFromCart = (id, variant, customColor, customDimensions) => {
    setCartItems(prev => prev.filter(item => !(
      item._id === id && 
      item.selectedVariant === variant &&
      item.customColor === customColor &&
      JSON.stringify(item.customDimensions || null) === JSON.stringify(customDimensions || null)
    )));
  };

  const updateQuantity = (id, variant, customColor, customDimensions, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item => (
        item._id === id && 
        item.selectedVariant === variant &&
        item.customColor === customColor &&
        JSON.stringify(item.customDimensions || null) === JSON.stringify(customDimensions || null)
      ) ? { ...item, quantity: newQuantity } : item)
    );
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
    const key = getCartKey();
    localStorage.removeItem(key);
  }, []);

  // Re-sync cart when user changes (login/logout)
  const syncCartForUser = useCallback(() => {
    const key = getCartKey();
    try {
      const savedCart = localStorage.getItem(key);
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      setCartItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCartItems([]);
    }
  }, []);

  const cartTotal = cartItems.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + Number(item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, syncCartForUser }}>
      {children}
      {/* Global Toast Container for Add To Cart */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto min-w-[300px]"
            >
              <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-full">
                <CheckCircle size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Success</p>
                <p className="text-xs text-gray-300 font-medium">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CartContext.Provider>
  );
};
