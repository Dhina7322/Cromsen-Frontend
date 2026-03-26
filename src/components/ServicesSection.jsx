import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUtils';

const API = import.meta.env.VITE_API_URL || "/api";

const ServicesSection = ({ isFooterView = false }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API}/services`);
        setServices(res.data.filter(s => s.isActive));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading || services.length === 0) return null;

  // For a truly seamless "A to Z to A" loop, we use 4 sets of items
  const scrollItems = [...services, ...services, ...services, ...services];

  return (
    <section className="py-10 bg-white overflow-hidden border-t border-gray-100">
      <div className="container mx-auto px-5 mb-10 text-left">
        <h2 className="text-2xl md:text-3xl font-sans text-[#0091d5] leading-tight font-medium relative inline-block">
          Services
          <div className="absolute -bottom-4 left-0 w-16 h-[3px] bg-[#0091d5]" />
        </h2>
      </div>

      {/* Auto Scrolling Container */}
      <div className="relative">
        <div className="flex animate-scroll hover:[animation-play-state:paused] w-max gap-4 md:gap-8 px-4 md:px-8">
          {scrollItems.map((s, idx) => (
            <Link 
               to={`/service/${s.slug}`} 
               key={`${s._id}-${idx}`} 
               className={`flex-shrink-0 relative ${isFooterView ? 'w-[200px] md:w-[280px] h-48' : 'w-[280px] md:w-[380px] aspect-[4/5] md:aspect-[3/4]'} overflow-hidden rounded-2xl group/item`}
            >
               <img 
                  src={getImageUrl(s.image)} 
                  alt={s.heading} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover/item:scale-110" 
               />
               
               {/* White Rectangular Label - Bottom Centered & Compact (Refined) */}
               <div className="absolute inset-0 flex items-end justify-center p-4 pb-8">
                  <div className="bg-white px-4 py-2 shadow-xl transition-all duration-300 transform group-hover/item:scale-105 border border-gray-50">
                     <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#222] whitespace-nowrap">
                        {s.heading}
                     </span>
                  </div>
               </div>
            </Link>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          animation: scroll 60s linear infinite;
        }
      `}} />
    </section>
  );
};

export default ServicesSection;
