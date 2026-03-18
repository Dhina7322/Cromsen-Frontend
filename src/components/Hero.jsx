import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Category / Slide Data ────────────────────────────────────────────────────
const categories = [
  {
    id: 'curtains',
    name: 'Curtains',
    description: 'Modern curtains that control light, ensure privacy, and transform your interiors.',
    href: '/shop?category=curtains',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
    heading: 'Curtains Are So Hot\nRight Now!',
    subheading: "It's all about colour this season with bold patterns, metallics...",
  },
  {
    id: 'blinds',
    name: 'Blinds',
    description: 'Premium-quality blinds crafted to enhance your windows with clean lines and smart functionality.',
    href: '/shop?category=blinds',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop',
    heading: 'Timeless Blinds\nFor Every Space',
    subheading: 'From roller to venetian — perfect light control for any room.',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Functional and elegant accessories that bring convenience, detail, and refinement to every space.',
    href: '/shop?category=accessories',
    image: 'https://images.unsplash.com/photo-1616489953149-8ba5dc422934?q=80&w=2070&auto=format&fit=crop',
    heading: 'Elegant\nAccessories',
    subheading: 'Rods, rings, tiebacks and more — the finishing touches that matter.',
  },
  {
    id: 'wallpapers',
    name: 'Wallpapers',
    description: 'Stunning wallpapers that bring texture, depth, and personality to any wall in your home.',
    href: '/shop?category=wallpapers',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2070&auto=format&fit=crop',
    heading: 'Beautiful\nWallpapers',
    subheading: 'Transform your walls with designs that tell your unique story.',
  },
];

// Preload all images so they're cached before AnimatePresence swaps them
categories.forEach(({ image }) => {
  const img = new Image();
  img.src = image;
});

// ─── HeroBackground ────────────────────────────────────────────────────────────
// Uses CSS background-image (not <img>) to avoid alt-text flash and grey frames
const HeroBackground = ({ image }) => (
  <AnimatePresence mode="sync">
    <motion.div
      key={image}
      className="absolute inset-0 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url("${image}")` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.75, ease: 'easeInOut' }}
    >
      {/* Dark gradient overlay — heavy on left so text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
    </motion.div>
  </AnimatePresence>
);

// ─── HeroContent ───────────────────────────────────────────────────────────────
const HeroContent = ({ category, onPrev, onNext }) => (
  <div className="relative z-10 flex flex-col justify-end h-full pb-14 pr-4 lg:pr-16 md:pb-24">
    <AnimatePresence mode="wait">
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-2 whitespace-pre-line drop-shadow-lg">
          {category.heading}
        </h1>
        {/* Orange separator */}
        <div className="w-10 h-[3px] bg-[#f1703b] my-4" />
        <p className="text-sm md:text-base text-white/80 font-sans max-w-sm leading-relaxed">
          {category.subheading}
        </p>
      </motion.div>
    </AnimatePresence>

    {/* Navigation arrows */}
    <div className="flex items-center space-x-3 mt-10">
      <button
        onClick={onPrev}
        aria-label="Previous"
        className="w-9 h-9 border border-white/50 text-white flex items-center justify-center hover:bg-white hover:text-[#162d3a] transition-all"
      >
        <ChevronLeft size={17} />
      </button>
      <button
        onClick={onNext}
        aria-label="Next"
        className="w-9 h-9 border border-white/50 text-white flex items-center justify-center hover:bg-white hover:text-[#162d3a] transition-all"
      >
        <ChevronRight size={17} />
      </button>
    </div>
  </div>
);

// ─── CategorySelector ─────────────────────────────────────────────────────────
const CategorySelector = ({ activeId, onSelect }) => (
  <div className="w-full h-full flex flex-col justify-start pt-32 z-10 overflow-y-auto no-scrollbar">
    {categories.map((cat, idx) => {
      const isActive = cat.id === activeId;
      return (
        <button
          key={cat.id}
          onClick={() => onSelect(idx)}
          className={`group text-left px-8 py-6 border-b border-white/10 transition-all duration-300 ${
            isActive ? 'bg-white/10' : 'hover:bg-white/5'
          }`}
        >
          {/* Name — also acts as link */}
          <Link
            to={cat.href}
            onClick={(e) => e.stopPropagation()}
            className="block"
          >
            <h3
              className={`text-xl md:text-2xl font-serif mb-1 transition-colors ${
                isActive ? 'text-white' : 'text-white/75 group-hover:text-white'
              }`}
            >
              {cat.name}
            </h3>
          </Link>

          {/* Orange / grey underline */}
          <div
            className={`h-[2px] w-8 mb-3 transition-all duration-300 ${
              isActive ? 'bg-[#f1703b]' : 'bg-white/25'
            }`}
          />

          {/* Description */}
          <p
            className={`text-xs font-sans leading-relaxed transition-colors ${
              isActive ? 'text-white/80' : 'text-white/45 group-hover:text-white/65'
            }`}
          >
            {cat.description}
          </p>
        </button>
      );
    })}
  </div>
);

// ─── HeroSection (Default Export) ────────────────────────────────────────────
const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goNext = useCallback(
    () => setActiveIndex((p) => (p + 1) % categories.length),
    []
  );
  const goPrev = useCallback(
    () => setActiveIndex((p) => (p - 1 + categories.length) % categories.length),
    []
  );

  // Auto-advance every 5 s
  useEffect(() => {
    const t = setInterval(goNext, 5000);
    return () => clearInterval(t);
  }, [goNext]);

  const active = categories[activeIndex];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100vh' }}>
      {/* Background (CSS bg-image, no <img> tag) - stays full width */}
      <HeroBackground image={active.image} />

      {/* Wrapped Content Container */}
      <div className="container mx-auto max-w-[1200px] px-5 h-full relative z-10">
        {/* Left text + arrows */}
        <div className="h-full lg:w-[calc(100%-280px)]">
          <HeroContent category={active} onPrev={goPrev} onNext={goNext} />
        </div>
      </div>

      {/* Right side category panel - Absolute to screen edge */}
      <div className="absolute right-0 top-0 h-full w-[280px] z-20 bg-black/55 backdrop-blur-[2px] border-l border-white/5 hidden lg:block">
         <CategorySelector activeId={active.id} onSelect={setActiveIndex} />
      </div>

      {/* Mobile panel container fallback for smaller screens */}
      <div className="lg:hidden absolute right-0 top-0 h-full w-[220px] bg-black/60 backdrop-blur-sm z-20">
         <CategorySelector activeId={active.id} onSelect={setActiveIndex} />
      </div>

      {/* Mobile slide dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-20 lg:hidden">
        {categories.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === activeIndex ? 'w-6 h-2 bg-[#f1703b]' : 'w-2 h-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
