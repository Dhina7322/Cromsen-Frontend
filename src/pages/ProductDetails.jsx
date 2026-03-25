import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getProductById, getReviewsByProduct, createReview, getProducts } from '../services/api';
import {
  ShoppingCart, ChevronRight, CheckCircle, Zap,
  Star, Send, User as UserIcon, MessageCircle, ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';
import ProductCard from '../components/ProductCard';

const API = import.meta.env.VITE_API_URL || "/api";

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star
        key={s}
        size={size}
        className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}
        fill={s <= rating ? 'currentColor' : 'none'}
      />
    ))}
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isHovered, setIsHovered]       = useState(false);
  const [isCustom, setIsCustom]         = useState(false);
  const [customWidth, setCustomWidth]   = useState('');
  const [customHeight, setCustomHeight] = useState('');

  // Reviews
  const [reviews, setReviews]             = useState([]);
  const [newReview, setNewReview]         = useState({ rating: 5, comment: '', userName: '', images: [], videos: [] });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg]         = useState('');

  // Related / Recently viewed
  const [relatedProducts, setRelatedProducts]   = useState([]);
  const [recentlyViewed, setRecentlyViewed]     = useState([]);

  const role = localStorage.getItem('userRole') || 'customer';

  /* ─── Fetch product ──────────────────────────────────────────────── */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);

        if (data?.slug && String(id) === String(data._id)) {
          navigate(`/product/${data.slug}`, { replace: true });
          return;
        }
        setProduct(data);

        // initial variant selection
        if (data?.variants?.length) {
          const init = {};
          data.variants.forEach(v => { if (v.options?.length) init[v.name] = v.options[0]; });
          setSelectedOptions(init);
        }

        // fetch approved reviews
        try {
          const rev = await getReviewsByProduct(data._id);
          setReviews(Array.isArray(rev) ? rev : []);
        } catch { setReviews([]); }

        // fetch related products
        try {
          const cats = Array.isArray(data.category) ? data.category : [data.category];
          const catId = cats[0]?._id || cats[0];
          if (catId) {
            const res = await getProducts({ category: catId, limit: 8 });
            const list = (res?.products || []).filter(p => p._id !== data._id).slice(0, 4);
            setRelatedProducts(list);
          }
        } catch { setRelatedProducts([]); }

        // recently viewed (localStorage)
        try {
          let visited = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          visited = visited.filter(p => p._id !== data._id);
          visited.unshift({
            _id: data._id, name: data.name, slug: data.slug,
            image: data.image, retailPrice: data.retailPrice,
            wholesalePrice: data.wholesalePrice, price: data.price,
            variants: data.variants,
          });
          visited = visited.slice(0, 10);
          localStorage.setItem('recentlyViewed', JSON.stringify(visited));
          setRecentlyViewed(visited.filter(p => p._id !== data._id).slice(0, 4));
        } catch { setRecentlyViewed([]); }

      } catch (err) {
        console.error('ProductDetails fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, navigate]);

  /* ─── Auto-slide ─────────────────────────────────────────────────── */
  const allImages = product ? [product.image, ...(product.images || [])].filter(Boolean) : [];

  useEffect(() => {
    if (loading || allImages.length <= 1 || isHovered) return;
    const t = setInterval(() => setSelectedImageIndex(p => (p + 1) % allImages.length), 4000);
    return () => clearInterval(t);
  }, [loading, allImages.length, isHovered]);

  /* ─── Loading / not found ────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 border-4 border-action border-t-transparent rounded-full"
      />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
      <Link to="/shop" className="text-action font-bold uppercase tracking-widest text-sm hover:underline">
        Back to Shop
      </Link>
    </div>
  );

  /* ─── Price logic ────────────────────────────────────────────────── */
  const currentCombinationKey = (product.variants || [])
    .map(v => selectedOptions[v.name]).filter(Boolean).join(' / ');
  const currentVariantItem = product.variantItems?.find(vi => vi.combination === currentCombinationKey);
  const stockAvailable = currentVariantItem ? currentVariantItem.stock : (product.stock || 0);

  let displayedPrice = 0;
  const originalPrice = Number(product.retailPrice || 0);

  if (isCustom) {
    const area = Number(customWidth || 0) * Number(customHeight || 0);
    const rate = role === 'dealer'
      ? Number(product.pricePerSqFtDealer || product.wholesalePrice || 0)
      : Number(product.pricePerSqFtRetail  || product.retailPrice   || 0);
    displayedPrice = area * rate;
  } else {
    displayedPrice = role === 'dealer'
      ? (currentVariantItem?.wholesalePrice || product.wholesalePrice || 0)
      : (currentVariantItem?.retailPrice    || product.retailPrice    || 0);
  }

  /* ─── Cart / Buy ─────────────────────────────────────────────────── */
  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: Number(displayedPrice),
      selectedVariant: isCustom
        ? `Custom ${customWidth}x${customHeight}`
        : currentCombinationKey,
      isCustom,
      customDimensions: isCustom ? { width: customWidth, height: customHeight } : null,
    });
  };
  const handleBuyNow = () => { handleAddToCart(); navigate('/checkout'); };

  /* ─── Review submit ──────────────────────────────────────────────── */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim() || !newReview.userName.trim()) return;
    try {
      setSubmittingReview(true);
      
      const formData = new FormData();
      formData.append('productId', String(product._id));
      formData.append('userName', newReview.userName.trim());
      formData.append('rating', String(newReview.rating));
      formData.append('comment', newReview.comment.trim());
      
      if (newReview.images && newReview.images.length > 0) {
        Array.from(newReview.images).forEach(f => formData.append('images', f));
      }
      if (newReview.videos && newReview.videos.length > 0) {
        Array.from(newReview.videos).forEach(f => formData.append('videos', f));
      }

      const res = await axios.post(`${API}/reviews`, formData);

      setReviewMsg('✓ Review submitted! It will appear after moderation.');
      setNewReview({ rating: 5, comment: '', userName: '', images: [], videos: [] });
    } catch (err) {
      console.error('[Review Submit] error:', err);
      const errMsg = err.response?.data?.message || 'Failed to submit review. Please try again.';
      setReviewMsg(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  /* ─── JSX ────────────────────────────────────────────────────────── */
  return (
    <div className="bg-white min-h-screen pt-28 pb-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-10">
          <Link to="/" className="hover:text-action transition-colors">Home</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <Link to="/shop" className="hover:text-action transition-colors">Products</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <span className="text-gray-800 truncate max-w-[180px]">{product.name}</span>
        </div>

        {/* ── Main product grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">

          {/* Gallery */}
          <div className="flex gap-4" style={{ height: 600 }}>
            {/* Main image */}
            <div
              className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 h-full"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  src={getImageUrl(allImages[selectedImageIndex])}
                  alt={product.name}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Stock badge */}
              <div className="absolute top-4 left-4 z-10">
                {stockAvailable > 0
                  ? <span className="flex items-center gap-1.5 bg-white/95 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-green-100">
                      <CheckCircle size={11} /> In Stock
                    </span>
                  : <span className="bg-red-50/95 text-red-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-red-100">
                      Out of Stock
                    </span>
                }
              </div>
            </div>

            {/* Thumbnails — right vertical strip */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-3 w-[80px] shrink-0 overflow-y-auto no-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0
                      ${selectedImageIndex === idx
                        ? 'border-gray-900 opacity-100 shadow'
                        : 'border-transparent opacity-50 hover:opacity-80'}`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {/* Category */}
            <div className="flex items-center gap-2 mb-4">
              <span className="h-[2px] w-6 bg-action" />
              <span className="text-action uppercase tracking-[0.3em] text-[10px] font-black">
                {Array.isArray(product.category)
                  ? (product.category[0]?.name || product.category[0] || 'General')
                  : (product.category?.name   || product.category   || 'General')}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-[1.2] mb-5">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-black text-gray-900">₹{Number(displayedPrice).toLocaleString()}</span>
              {role === 'dealer' && originalPrice > displayedPrice && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 line-through font-bold">MRP ₹{originalPrice.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Dealer price</span>
                </div>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm text-gray-600 font-medium border-l-4 border-action pl-4 py-1 bg-gray-50 rounded-r-xl mb-6">
                {product.shortDescription}
              </p>
            )}

            {/* Variants (Thicknedd, Color, etc) - Always show */}
            {product.variants?.length > 0 && (
              <div className="space-y-5 mb-6">
                {product.variants.map((variant, vIdx) => (
                  <div key={vIdx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-black text-gray-400">{variant.name}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-600">{selectedOptions[variant.name]}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((opt, oIdx) => (
                        <button key={oIdx}
                          onClick={() => {
                            setSelectedOptions({ ...selectedOptions, [variant.name]: opt });
                            // If user is picking standard variants, we might want to disable custom size?
                            // Or keep it enabled depending on product.
                          }}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all
                            ${selectedOptions[variant.name] === opt
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-transparent bg-gray-50 text-gray-400 hover:border-gray-300'}`}
                        >{opt}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Size Toggle Button */}
            {product.isCustomSizeEnabled && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    setIsCustom(!isCustom);
                    // Clear inputs when disabling
                    if (isCustom) {
                      setCustomWidth('');
                      setCustomHeight('');
                    }
                  }}
                  className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2
                    ${isCustom
                      ? 'bg-gray-100 text-gray-900 border-gray-900'
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}
                >
                  {isCustom ? '✕ Cancel Custom Size' : '+ Calculate Custom Size (Sq. Ft)'}
                </button>
              </div>
            )}

            {/* Custom inputs - Width & Height only */}
            {isCustom && (
              <div className="mb-6 space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-action mb-2">Size Calculation</p>
                <div className="grid grid-cols-2 gap-4">
                  {[['Width (ft)', customWidth, setCustomWidth], ['Height (ft)', customHeight, setCustomHeight]].map(([label, val, setter]) => (
                    <div key={label}>
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1 block">{label}</label>
                      <input type="number" placeholder="0" value={val}
                        onChange={e => setter(e.target.value)}
                        className="w-full px-4 py-2 text-sm bg-white border-2 border-gray-100 rounded-xl outline-none focus:border-action font-bold text-gray-700" />
                    </div>
                  ))}
                </div>
                {customWidth && customHeight && (
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Total Area</p>
                      <p className="text-sm font-bold text-gray-900">{Number(customWidth) * Number(customHeight)} sq ft</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Rate</p>
                      <p className="text-sm font-bold text-gray-900">₹{Number(role === 'dealer' ? product.pricePerSqFtDealer : product.pricePerSqFtRetail).toLocaleString()} <span className="text-[10px] text-gray-400">/sq ft</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Custom Price</p>
                      <p className="text-sm font-black text-action">₹{Number(displayedPrice).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-3">
              <button onClick={handleAddToCart}
                disabled={!isCustom && stockAvailable <= 0}
                className="w-full h-14 bg-[#1e293b] hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
                <ShoppingCart size={16} />
                {(!isCustom && stockAvailable <= 0) ? 'Unavailable' : 'Add To Cart'}
              </button>
              <button onClick={handleBuyNow}
                disabled={!isCustom && stockAvailable <= 0}
                className="w-full h-14 bg-action hover:brightness-110 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
                <Zap size={16} />
                {(!isCustom && stockAvailable <= 0) ? 'Unavailable' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>

        {/* ══ Description Section ══════════════════════════════════════ */}
        {product.description && (
          <div className="mt-16 border-t border-gray-100 pt-12">
            <h3 className="text-[11px] uppercase tracking-[0.25em] font-black text-gray-400 mb-3">Product Details</h3>
            <div
              className="text-gray-600 leading-relaxed text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* ══ Reviews Section ══════════════════════════════════════════ */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">Customer Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Submit form */}
            <div className="lg:col-span-4">
              {/* Average score */}
              {avgRating && (
                <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl">
                  <span className="text-5xl font-black text-gray-900">{avgRating}</span>
                  <div>
                    <StarRating rating={Math.round(Number(avgRating))} />
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1">
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4 bg-gray-50 p-6 rounded-2xl">
                <p className="text-[11px] uppercase tracking-widest font-black text-gray-500 mb-2">Write a Review</p>

                <input
                  type="text"
                  placeholder="Your name"
                  value={newReview.userName}
                  onChange={e => setNewReview({ ...newReview, userName: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-action"
                />

                {/* Star picker */}
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Rating</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button"
                        onClick={() => setNewReview({ ...newReview, rating: s })}
                        className="transition-transform hover:scale-110">
                        <Star size={26}
                          className={newReview.rating >= s ? 'text-yellow-400' : 'text-gray-200'}
                          fill={newReview.rating >= s ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Share your experience…"
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold h-28 outline-none focus:border-action resize-none"
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Add Media (Photos & Videos)</label>
                  <div className="flex gap-2">
                    {/* Photos input */}
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      id="photo-upload"
                      className="hidden"
                      onChange={e => {
                        const newImgs = Array.from(e.target.files).slice(0, 5);
                        setNewReview(prev => ({ ...prev, images: [...prev.images, ...newImgs].slice(0, 5) }));
                        e.target.value = '';
                      }}
                    />
                    <label 
                      htmlFor="photo-upload"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-dashed border-blue-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-all text-[11px] font-bold text-blue-400"
                    >
                      <ImageIcon size={14} />
                      {newReview.images.length > 0 ? `${newReview.images.length} Photo${newReview.images.length > 1 ? 's' : ''}` : 'Add Photos'}
                    </label>
                    {/* Videos input */}
                    <input 
                      type="file" 
                      multiple
                      accept="video/*"
                      id="video-upload"
                      className="hidden"
                      onChange={e => {
                        const newVids = Array.from(e.target.files).slice(0, 2);
                        setNewReview(prev => ({ ...prev, videos: [...prev.videos, ...newVids].slice(0, 2) }));
                        e.target.value = '';
                      }}
                    />
                    <label 
                      htmlFor="video-upload"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-dashed border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-all text-[11px] font-bold text-purple-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                      {newReview.videos.length > 0 ? `${newReview.videos.length} Video${newReview.videos.length > 1 ? 's' : ''}` : 'Add Videos'}
                    </label>
                  </div>
                  {/* Previews */}
                  {(newReview.images.length > 0 || newReview.videos.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {newReview.images.map((img, i) => (
                        <div key={`img-${i}`} className="relative w-14 h-14 rounded-lg overflow-hidden border border-blue-100">
                          <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                          <button type="button" onClick={() => setNewReview(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">✕</button>
                        </div>
                      ))}
                      {newReview.videos.map((vid, i) => (
                        <div key={`vid-${i}`} className="relative w-14 h-14 rounded-lg overflow-hidden border border-purple-100 bg-purple-50 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                          <button type="button" onClick={() => setNewReview(prev => ({ ...prev, videos: prev.videos.filter((_, idx) => idx !== i) }))} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={submittingReview}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
                  <Send size={13} />
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>

                {reviewMsg && (
                  <p className={`text-[11px] font-bold text-center ${reviewMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>
                    {reviewMsg}
                  </p>
                )}
              </form>
            </div>

            {/* Reviews list */}
            <div className="lg:col-span-8">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-150">
                  <MessageCircle size={40} className="text-gray-200 mb-3" />
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {reviews.map(review => (
                    <div key={review._id} className="pb-8 border-b border-gray-100 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserIcon size={17} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-tight">{review.userName}</p>
                            <StarRating rating={review.rating} size={12} />
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-3 py-1 rounded-full">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm pl-12">"{review.comment}"</p>
                      
                      {(review.images?.length > 0 || review.videos?.length > 0) && (
                        <div className="flex flex-wrap gap-3 mt-4 ml-12">
                          {review.images?.map((img, i) => (
                            <img 
                              key={i} 
                              src={getImageUrl(img)} 
                              alt="Review" 
                              className="w-20 h-20 object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(getImageUrl(img), '_blank')}
                            />
                          ))}
                          {review.videos?.map((vid, i) => (
                            <video 
                              key={i} 
                              src={getImageUrl(vid)} 
                              className="w-20 h-20 object-cover rounded-lg border border-gray-100 cursor-pointer"
                              controls
                            />
                          ))}
                        </div>
                      )}

                      {review.adminReply && (
                        <div className="mt-5 ml-12 p-4 bg-orange/5 border-l-4 border-orange rounded-r-xl">
                          <p className="text-[10px] uppercase tracking-widest font-black text-orange mb-1">Response from Cromsen Importers</p>
                          <p className="text-gray-700 text-sm leading-relaxed font-medium">
                            {review.adminReply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* Related Products                                          */}
        {/* ══════════════════════════════════════════════════════════ */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-gray-100 pt-16">
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
              <Link to="/shop" className="text-[11px] font-black uppercase tracking-widest text-action hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* Recently Viewed                                           */}
        {/* ══════════════════════════════════════════════════════════ */}
        {recentlyViewed.length >= 1 && (
          <div className="mt-20 border-t border-gray-100 pt-16">
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewed.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;