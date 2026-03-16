import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/api';
import { ShoppingCart, ChevronRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
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
  const displayedPrice = Number(product.price || (role === 'dealer' ? product.wholesalePrice : product.retailPrice) || 0);
  const originalPrice = Number(product.retailPrice || 0);

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
              className="bg-gray-100"
            >
              <img 
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=2000&auto=format&fit=crop&blur=10'} 
                alt={product.name} 
                className="w-full h-auto object-cover"
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {(product.images || []).map((img, idx) => (
                <div key={idx} className="bg-white border border-transparent hover:border-primary cursor-pointer transition-all">
                  <img src={img} alt={product.name} className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-accent uppercase tracking-[0.2em] text-xs font-semibold mb-4">
              {product.category?.name || product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight font-bold">{product.name}</h1>
            
            <div className="flex flex-col mb-8">
              <p className="text-3xl font-serif text-action font-bold">₹{(!isNaN(displayedPrice) && displayedPrice > 0) ? displayedPrice.toFixed(2) : '0.00'}</p>
              {role === 'dealer' && originalPrice && originalPrice > displayedPrice && (
                <p className="text-sm text-gray-400 line-through">MRP: ₹{originalPrice.toFixed(2)}</p>
              )}
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-10 font-light text-lg">
              {product.description}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && product.variants.map((variant, vIdx) => (
              <div key={vIdx} className="mb-8">
                <h3 className="text-xs uppercase tracking-widest font-bold mb-4">{variant.name}</h3>
                <div className="flex flex-wrap gap-3">
                  {variant.options.map((opt, oIdx) => (
                    <button 
                      key={oIdx}
                      className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all ${selectedVariant === oIdx ? 'border-action bg-action text-white' : 'border-gray-200 hover:border-action'}`}
                      onClick={() => setSelectedVariant(oIdx)}
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
                onClick={() => addToCart({ ...product, price: Number(displayedPrice) || 0 })}
                className="flex-grow bg-action hover:bg-primary text-white font-bold py-4 text-xs uppercase tracking-widest transition-colors flex items-center justify-center space-x-3 shadow-md"
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
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
