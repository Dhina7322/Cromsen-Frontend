import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUtils';

const API = import.meta.env.VITE_API_URL || "/api";

const ServicesSection = () => {
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

  // For the auto-scrolling, we can duplicate the services list to create a seamless loop
  const scrollItems = [...services, ...services, ...services];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-5 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-xl">
           <span className="text-action font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Specialized Care</span>
           <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Expert Services for <br /> Your Home Interior</h2>
        </div>
        <Link to="/services" className="px-10 py-4 bg-white border-2 border-primary text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 leading-none h-fit">
           View All Services
        </Link>
      </div>

      {/* Auto Scrolling Container */}
      <div className="relative group">
        <div className="flex animate-scroll hover:[animation-play-state:paused] gap-4 md:gap-8 px-4 md:px-8">
          {scrollItems.map((s, idx) => (
            <Link 
               to={`/service/${s.slug}`} 
               key={`${s._id}-${idx}`} 
               className="flex-shrink-0 relative w-[280px] md:w-[380px] aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-2xl group/item"
            >
               <img 
                  src={getImageUrl(s.image)} 
                  alt={s.heading} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover/item:scale-110" 
               />
               
               {/* Overlay with Label (As per reference image) */}
               <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
                  <div className="bg-white/95 backdrop-blur-md px-10 py-4 shadow-2xl shadow-black/10 transition-all duration-300 transform group-hover/item:-translate-y-2">
                     <span className="text-xs font-black uppercase tracking-[0.2em] text-primary whitespace-nowrap">
                        {s.heading}
                     </span>
                  </div>
               </div>

               {/* Hint of short description on hover */}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center p-12 text-center pointer-events-none">
                  <p className="text-white text-xs font-sans leading-relaxed tracking-wide translate-y-4 group-hover/item:translate-y-0 transition-transform duration-500">
                     {s.shortDescription}
                  </p>
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
          width: fit-content;
          animation: scroll 60s linear infinite;
        }
      `}} />
    </section>
  );
};

export default ServicesSection;
