import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, ImageIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const role = localStorage.getItem('userRole');

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use price provided by backend (which is role-aware) or fallback
    const rawPrice = product.price || (role === 'dealer' ? product.wholesalePrice : product.retailPrice);
    const priceToUse = Number(rawPrice) || 0;
    addToCart({ ...product, price: priceToUse });
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
        <Link to={`/product/${product._id}`} className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
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
            onClick={handleAddToCart}
            className="flex-grow bg-[#2f2f2f] text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-action transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingCart size={14} />
            <span>Add to Cart</span>
          </button>
          <Link 
            to={`/product/${product._id}`} 
            className="bg-white text-primary p-3 hover:bg-action hover:text-white transition-colors flex items-center justify-center"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>
      
      <div className="w-full px-2">
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-[13px] font-sans text-gray-800 mb-1 group-hover:text-action transition-colors truncate">
            {product.name}
          </h3>
        </Link>
        <div className="flex flex-col items-center">
          <p className="text-action font-bold text-sm tracking-tight">
            ₹{(!isNaN(displayedPrice) && displayedPrice > 0) ? displayedPrice.toFixed(2) : '0.00'}
          </p>
          {role === 'dealer' && originalPrice && originalPrice > displayedPrice && (
            <p className="text-[10px] text-gray-400 line-through">
              MRP: ₹{originalPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
