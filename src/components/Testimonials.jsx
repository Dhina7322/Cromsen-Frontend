import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: "Jenny",
    role: "Homeowner",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Our new blinds look sleek and provide perfect light control. The team was reliable, friendly, and ensured a flawless installation."
  },
  {
    id: 2,
    name: "Joseph",
    role: "Interior Designer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "The made-to-measure curtains are beautifully crafted and fit perfectly in our home. Excellent quality and professional service from start to finish."
  },
  {
    id: 3,
    name: "Emma Williams",
    role: "Architect",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "We've specified Cromsen's drapery hardware for multiple commercial projects. Reliable, durable, and aesthetically stunning products."
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-primary text-white overflow-hidden">
      <div className="container mx-auto px-5 max-w-[1200px] flex flex-col items-center">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-serif tracking-wide mb-2">Testimonials</h2>
          <div className="w-12 h-0.5 bg-[#e67e22] mt-1" />
        </div>

        {/* Content Slider */}
        <div className="relative w-full max-w-4xl h-[280px] md:h-[180px] mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              <p className="text-xl md:text-2xl font-serif text-gray-300 italic leading-relaxed mb-8">
                "{testimonials[activeIndex].content}"
              </p>
              <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-gray-400">
                {testimonials[activeIndex].name}
              </h4>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Profile Navigation Icons with Decorative Lines */}
        <div className="flex items-center w-full max-w-4xl px-4 mt-8">
          <div className="flex-grow h-px bg-white/10" />
          
          <div className="flex items-center gap-4 md:gap-8 px-8 md:px-12">
            {testimonials.map((test, index) => (
              <button
                key={test.id}
                onClick={() => setActiveIndex(index)}
                className={`relative rounded-full transition-all duration-500 overflow-hidden ${
                  activeIndex === index 
                    ? 'w-16 h-16 md:w-24 md:h-24 border-2 border-white scale-110 shadow-2xl z-10' 
                    : 'w-12 h-12 md:w-16 md:h-16 border-2 border-transparent opacity-30 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img 
                  src={test.image} 
                  alt={test.name} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex-grow h-px bg-white/10" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
