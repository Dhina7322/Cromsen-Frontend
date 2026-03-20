import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/api';
import { ShoppingCart, ChevronRight, Truck, ShieldCheck, RefreshCw, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
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
  const currentCombinationKey = product ? Object.values(selectedOptions).join(' / ') : '';
  const currentVariantItem = product?.variantItems?.find(vi => vi.combination === currentCombinationKey);

  const displayedPrice = currentVariantItem ? currentVariantItem.price : Number(product?.price || (role === 'dealer' ? product?.wholesalePrice : product?.retailPrice) || 0);
  const originalPrice = Number(product?.retailPrice || 0);
  const stockAvailable = currentVariantItem ? currentVariantItem.stock : (product?.stock || 0);

  // Get the main product image URL
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const mainImageUrl = selectedImage || getImageUrl(product.image || product.images?.[0]);

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto max-w-[1200px] px-5">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-400 mb-12">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-neutral-dark">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-100 flex items-center justify-center min-h-[400px]"
            >
              {mainImageUrl ? (
                <img 
                  src={mainImageUrl} 
                  alt={product.name} 
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300 py-32">
                  <ImageIcon size={64} className="opacity-50 mb-4" />
                  <span className="text-sm font-sans uppercase tracking-widest font-bold opacity-50">No Image Available</span>
                </div>
              )}
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {allImages.map((img, idx) => (
                <div key={idx} className={`bg-white border hover:border-primary cursor-pointer transition-all ${selectedImage === getImageUrl(img) ? 'border-primary' : 'border-transparent'}`} onClick={() => setSelectedImage(getImageUrl(img))}>
                  <img src={getImageUrl(img)} alt={product.name} className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-accent uppercase tracking-[0.2em] text-xs font-semibold mb-4">
              {product.category?.name || product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif mb-2 leading-tight font-bold">{product.name}</h1>
            
            <div className="flex flex-col mb-4">
              <p className="text-3xl font-serif text-action font-bold">₹{(!isNaN(displayedPrice) && displayedPrice > 0) ? displayedPrice.toFixed(2) : '0.00'}</p>
              <p className={`text-xs mt-1 font-bold ${stockAvailable > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {stockAvailable > 0 ? `${stockAvailable} in stock` : 'Out of stock'}
              </p>
              {role === 'dealer' && originalPrice && originalPrice > displayedPrice && (
                <p className="text-sm text-gray-400 line-through">MRP: ₹{originalPrice.toFixed(2)}</p>
              )}
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-10 font-light text-lg">
              {product.description}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && product.variants.map((variant, vIdx) => (
              <div key={vIdx} className="mb-6">
                <h3 className="text-xs uppercase tracking-widest font-bold mb-3">{variant.name}</h3>
                <div className="flex flex-wrap gap-3">
                  {variant.options.map((opt, oIdx) => (
                    <button 
                      key={oIdx}
                      className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all ${selectedOptions[variant.name] === opt ? 'border-action bg-action text-white' : 'border-gray-200 hover:border-action'}`}
                      onClick={() => setSelectedOptions({ ...selectedOptions, [variant.name]: opt })}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex space-x-4 mb-12">
              <button 
                onClick={() => addToCart({ ...product, price: Number(displayedPrice) || 0, selectedVariant: currentCombinationKey })}
                className="flex-grow bg-action hover:bg-primary text-white font-bold py-4 text-xs uppercase tracking-widest transition-colors flex items-center justify-center space-x-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={stockAvailable <= 0}
              >
                <ShoppingCart size={18} />
                <span>{stockAvailable > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>
            </div>

            {/* Features Info */}
            <div className="border-t border-gray-100 pt-10 space-y-6">
              <div className="flex items-center space-x-4">
                <Truck size={18} className="text-action" />
                <p className="text-sm uppercase tracking-widest text-gray-500">Free nationwide shipping</p>
              </div>
              <div className="flex items-center space-x-4">
                <ShieldCheck size={18} className="text-action" />
                <p className="text-sm uppercase tracking-widest text-gray-500">5-year quality warranty</p>
              </div>
              <div className="flex items-center space-x-4">
                <RefreshCw size={18} className="text-action" />
                <p className="text-sm uppercase tracking-widest text-gray-500">30-day money back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
