import { createContext, useState, useContext, useEffect, useCallback } from 'react';

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
<<<<<<< Updated upstream
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
=======
    try {
      const key = getCartKey();
      const savedCart = localStorage.getItem(key);
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
>>>>>>> Stashed changes
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

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item => (item._id === id ? { ...item, quantity: newQuantity } : item))
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
    </CartContext.Provider>
  );
};
