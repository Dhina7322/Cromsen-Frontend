import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getImageUrl } from '../utils/imageUtils';
import { ArrowLeft, Clock, Shield, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "/api";

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(`${API}/services/${slug}`);
        setService(res.data);
      } catch (err) {
        console.error(err);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug, navigate]);

  if (loading) {
     return (
       <div className="min-h-screen pt-40 flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
   }

   if (!service) return null;

   return (
     <div className="min-h-screen pt-32 pb-20 bg-white">
        <div className="container mx-auto px-5">
           {/* Breadcrumb / Back button */}
           <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
           >
              <Link 
                 to="/services" 
                 className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-action transition-colors"
              >
                 <ArrowLeft size={14} /> Back to Services
              </Link>
           </motion.div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              {/* Image Section */}
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="lg:col-span-7"
              >
                 <div className="relative aspect-[16/9] lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-black/10 border border-gray-100">
                    <img 
                       src={getImageUrl(service.image)} 
                       alt={service.heading} 
                       className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                 </div>
              </motion.div>

              {/* Content Section */}
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="lg:col-span-5"
              >
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-action/10 rounded-xl flex items-center justify-center text-action">
                       <Shield size={20} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Trusted Service Provider</span>
                 </div>

                 <h1 className="text-4xl lg:text-5xl font-serif text-primary mb-8 leading-tight">{service.heading}</h1>
                 
                 <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl mb-10">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                       <Clock size={14} className="text-action" /> Feature Overview
                    </h4>
                    <p className="text-gray-500 text-sm italic font-sans italic leading-relaxed tracking-wide">
                       {service.shortDescription}
                    </p>
                 </div>

                 <div className="space-y-6 text-gray-600">
                    <div className="prose prose-sm font-sans max-w-none leading-relaxed tracking-wide text-sm">
                       {service.longDescription.split('\n').map((para, i) => (
                          <p key={i} className={para.trim() ? "mb-4" : ""}>{para}</p>
                       ))}
                    </div>
                 </div>

                 <div className="mt-12 pt-12 border-t border-gray-100 grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                          <CheckCircle size={14} />
                       </div>
                       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Expert Care</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                          <CheckCircle size={14} />
                       </div>
                       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Global Standards</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                          <CheckCircle size={14} />
                       </div>
                       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">On-Time</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                          <CheckCircle size={14} />
                       </div>
                       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Best Tools</span>
                    </div>
                 </div>

                 <Link 
                    to="/contact"
                    className="mt-12 block w-full bg-primary text-white text-center py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95 shadow-primary/20"
                 >
                    Inquire for Service
                 </Link>
              </motion.div>
           </div>
        </div>
     </div>
   );
};

export default ServiceDetail;
