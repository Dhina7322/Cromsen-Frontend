import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { ShoppingCart, ChevronRight, Truck, ShieldCheck, RefreshCw, ImageIcon, CheckCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data && data.variants && data.variants.length > 0) {
          const initialOptions = {};
          data.variants.forEach(v => {
            if (v.options && v.options.length > 0) {
              initialOptions[v.name] = v.options[0];
            }
          });
          setSelectedOptions(initialOptions);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const allImages = product ? [product.image, ...(product.images || [])].filter(Boolean) : [];

  // Auto-slide logic
  useEffect(() => {
    if (loading || allImages.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [loading, allImages.length, isHovered]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!product) return (
    <div className="pt-40 text-center">
      <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
      <Link to="/shop" className="text-primary hover:underline">Back to Shop</Link>
    </div>
  );

  const role = localStorage.getItem('userRole');
  
  // Find current combination
  const currentCombinationKey = Object.values(selectedOptions).join(' / ');
  const currentVariantItem = product?.variantItems?.find(vi => vi.combination === currentCombinationKey);

  // Price Calculation
  let displayedPrice = 0;
  let originalPrice = Number(product?.retailPrice || 0);

  if (role === 'dealer') {
    displayedPrice = currentVariantItem?.wholesalePrice || product.wholesalePrice || 0;
  } else {
    displayedPrice = currentVariantItem?.retailPrice || product.retailPrice || 0;
  }

  const stockAvailable = currentVariantItem ? currentVariantItem.stock : (product?.stock || 0);
  const mainImageUrl = getImageUrl(allImages[selectedImageIndex]);

  const handleBuyNow = () => {
    addToCart({ ...product, price: Number(displayedPrice), selectedVariant: currentCombinationKey });
    navigate('/checkout');
  };

  return (
    <div className="pt-32 pb-20 bg-white">
      <div className="container mx-auto max-w-[1240px] px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-10 font-bold">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <Link to="/shop" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Image Section (Gallery on Top/Side) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Main Image Slider */}
            <div className="md:col-span-10 order-1">
              <div 
                className="relative aspect-square bg-white rounded-[2rem] overflow-hidden group cursor-zoom-in border border-gray-100 shadow-sm"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={selectedImageIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    src={mainImageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Status Badge */}
                <div className="absolute top-6 left-6">
                    {stockAvailable > 0 ? (
                        <span className="bg-white/90 backdrop-blur-md text-[#10b981] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-2 shadow-sm">
                            <CheckCircle size={12} /> In Stock
                        </span>
                    ) : (
                        <span className="bg-red-50/90 backdrop-blur-md text-red-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm">
                            Out of Stock
                        </span>
                    )}
                </div>
              </div>
            </div>

            {/* Thumbnails (Vertical on the right) */}
            <div className="md:col-span-2 order-2 flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar py-1">
              {allImages.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => {
                    setSelectedImageIndex(idx);
                    setIsHovered(true);
                  }}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 md:w-full aspect-square rounded-[1.5rem] overflow-hidden border-2 transition-all duration-300 ${selectedImageIndex === idx ? 'border-[#1e293b] shadow-xl scale-95 ring-4 ring-[#1e293b]/5' : 'border-transparent bg-gray-50/50 opacity-60 hover:opacity-100 hover:scale-105'}`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

          </div>

          {/* Info Section */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <div className="flex items-center gap-3 mb-6">
                <span className="h-[2px] w-8 bg-action"></span>
                <span className="text-action uppercase tracking-[0.3em] text-[10px] font-black">
                    {Array.isArray(product.category) 
                      ? (product.category[0]?.name || product.category[0] || "General") 
                      : (product.category?.name || product.category || "General")}
                </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-[1.2]">{product.name}</h1>
            
            <div className="flex items-baseline gap-4 mb-8">
              <p className="text-4xl font-bold text-gray-900 font-sans">₹{displayedPrice.toLocaleString()}</p>
              {role === 'dealer' && originalPrice > displayedPrice && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 line-through font-bold uppercase tracking-widest">MRP: ₹{originalPrice.toLocaleString()}</span>
                  <span className="text-[10px] text-green-600 font-black uppercase tracking-wider italic mt-0.5">Dealer exclusive price</span>
                </div>
              )}
            </div>

            <p className="text-gray-500 leading-relaxed mb-10 text-sm font-medium">
              {product.description}
            </p>

            {/* Variants Picker */}
            <div className="space-y-8 mb-12">
                {product.variants && product.variants.map((variant, vIdx) => (
                    <div key={vIdx} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[11px] uppercase tracking-[0.2em] font-black text-gray-400">{variant.name}</h3>
                            <span className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-600">{selectedOptions[variant.name]}</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {variant.options.map((opt, oIdx) => (
                                <button 
                                    key={oIdx}
                                    onClick={() => setSelectedOptions({ ...selectedOptions, [variant.name]: opt })}
                                    className={`px-5 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-200 border-2 ${selectedOptions[variant.name] === opt ? 'border-primary bg-primary text-white shadow-xl shadow-blue-900/10 scale-105' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Actions */}
            <div className="flex flex-col gap-4 mb-12">
              {/* Add to Cart */}
              <button 
                onClick={() => addToCart({ ...product, price: Number(displayedPrice), selectedVariant: currentCombinationKey })}
                disabled={stockAvailable <= 0}
                className="w-full h-16 bg-[#1e293b] hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
              >
                <ShoppingCart size={18} className="group-hover:translate-x-1 transition-transform" />
                <span>{stockAvailable > 0 ? 'Add To Cart' : 'Currently Unavailable'}</span>
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={stockAvailable <= 0}
                className="w-full h-16 bg-action hover:brightness-110 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-action/20 active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
              >
                <Zap size={18} className="group-hover:scale-110 transition-transform" />
                <span>{stockAvailable > 0 ? 'Buy Now' : 'Currently Unavailable'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;