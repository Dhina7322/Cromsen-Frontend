import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, ImageIcon, Zap, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');

  const isInCart = cartItems?.some(item => item._id === product._id);

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For Buy Now, if selection is needed, it's better to go to detail page
    // but we'll try to use default if possible to match user preference for "stay on page"
    const selectedVariant = product.variants?.length > 0 
      ? product.variants.map(v => v.options?.[0]).filter(Boolean).join(' / ') 
      : null;
    
    const rawPrice = product.price || (role === 'dealer' ? product.wholesalePrice : product.retailPrice);
    const priceToUse = Number(rawPrice) || 0;
    addToCart({ ...product, price: priceToUse, selectedVariant });
    navigate('/checkout');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Instead of navigating to detail page, we add with default variants
    const selectedVariant = product.variants?.length > 0 
      ? product.variants.map(v => v.options?.[0]).filter(Boolean).join(' / ') 
      : null;

    const rawPrice = product.price || (role === 'dealer' ? product.wholesalePrice : product.retailPrice);
    const priceToUse = Number(rawPrice) || 0;
    addToCart({ ...product, price: priceToUse, selectedVariant });
  };

  const displayedPrice = Number(product.price || (role === 'dealer' ? product.wholesalePrice : product.retailPrice) || 0);
  const originalPrice = Number(product.retailPrice || 0);

  // Get the product image URL if it exists
  const imageUrl = getImageUrl(product.image || product.images?.[0]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col items-center text-center"
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50 mb-4 group cursor-pointer border border-gray-100">
        <Link to={`/product/${product.slug || product._id}`} className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 transition-transform duration-700 ease-out group-hover:scale-105">
              <ImageIcon size={48} className="opacity-50 mb-2" />
              <span className="text-xs font-sans uppercase tracking-widest font-bold opacity-50">No Image</span>
            </div>
          )}
        </Link>
        
        {/* Hover Actions - Slide up from bottom */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex space-x-2 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/50 to-transparent pt-12">
          <button 
            onClick={handleBuyNow}
            className="flex-grow bg-[#2f2f2f] text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-action transition-colors flex items-center justify-center space-x-2"
          >
            <Zap size={14} />
            <span>Buy Now</span>
          </button>
          <Link 
            to={`/product/${product.slug || product._id}`} 
            className="bg-white text-primary p-3 hover:bg-action hover:text-white transition-colors flex items-center justify-center"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>
      
      <div className="w-full px-2">
        <Link to={`/product/${product.slug || product._id}`} className="block">
          <h3 className="text-[13px] font-sans text-gray-800 mb-1 group-hover:text-action transition-colors truncate">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-col items-center w-full pb-3">
          <p className="text-action font-bold text-sm tracking-tight">
            ₹{(!isNaN(displayedPrice) && displayedPrice > 0) ? displayedPrice.toFixed(2) : '0.00'}
          </p>
          {role === 'dealer' && originalPrice && originalPrice > displayedPrice && (
            <p className="text-[10px] text-gray-400 line-through">
              MRP: ₹{originalPrice.toFixed(2)}
            </p>
          )}
          <button 
            onClick={handleAddToCart}
            className={`w-full mt-3 py-2 border text-[11px] font-bold uppercase tracking-widest transition-colors shrink-0 flex items-center justify-center space-x-2 ${
              isInCart 
                ? 'bg-action border-action text-white' 
                : 'bg-white border-gray-200 text-gray-800 hover:bg-action hover:border-action hover:text-white'
            }`}
            title="Add to Cart"
          >
            {isInCart ? <CheckCircle size={14} /> : <ShoppingCart size={14} />}
            <span>{isInCart ? 'Added to Cart' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
