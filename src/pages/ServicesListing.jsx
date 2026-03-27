import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getImageUrl } from '../utils/imageUtils';
import { ArrowRight, Wrench, Shield, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "/api";

const ServicesListing = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop" 
            alt="Services" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-primary/30 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-white/70 uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">Our Expertise</span>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight">Services</h1>
            <div className="flex items-center justify-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-widest">
               <Link to="/" className="hover:text-white transition-colors">Home</Link>
               <span className="w-1 h-1 rounded-full bg-action" />
               <span className="text-white">All Services</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <div className="container mx-auto px-5 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {services.map((s, idx) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-6 bg-gray-100 shadow-xl shadow-black/5">
                <img 
                  src={getImageUrl(s.image)} 
                  alt={s.heading} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-2xl font-serif text-primary mb-3 group-hover:text-action transition-colors">{s.heading}</h3>
              <p className="text-gray-500 text-[13px] font-sans leading-relaxed mb-6 tracking-wide line-clamp-2">
                {s.shortDescription}
              </p>
              <Link 
                to={`/service/${s.slug}`}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
              >
                Learn More <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Section */}
      <section className="mt-32 bg-gray-50 py-20 border-y border-gray-100">
         <div className="container mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-action mb-6">
                     <Wrench size={32} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-lg font-serif text-primary mb-3 uppercase tracking-wider">Expert Team</h4>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-xs">Our certified technicians have years of experience in the industry.</p>
               </div>
               <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-action mb-6">
                     <Shield size={32} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-lg font-serif text-primary mb-3 uppercase tracking-wider">Quality Assurance</h4>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-xs">We stand behind every service with a comprehensive warranty.</p>
               </div>
               <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-action mb-6">
                     <CheckCircle size={32} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-lg font-serif text-primary mb-3 uppercase tracking-wider">Precision Fit</h4>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-xs">Custom measurements ensure a perfect fit for any window size.</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default ServicesListing;
