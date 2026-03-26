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
      <div className="min-h-screen pt-24 pb-16 bg-white">
         <div className="container mx-auto px-5">
            {/* Breadcrumb / Back button */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="mb-8"
            >
               <Link 
                  to="/services" 
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-action transition-colors"
               >
                  <ArrowLeft size={14} /> Back to Services
               </Link>
            </motion.div>

            {/* Post-style centered layout */}
            <div className="max-w-3xl mx-auto">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-10"
               >
                  <div className="relative aspect-[16/10] rounded-[30px] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 max-w-2xl mx-auto">
                     <img 
                        src={getImageUrl(service.image)} 
                        alt={service.heading} 
                        className="w-full h-full object-cover" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
               </motion.div>

               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-5 md:px-0 text-center"
               >
                  <div className="flex items-center justify-center gap-3 mb-6">
                     <div className="w-8 h-8 bg-action/10 rounded-lg flex items-center justify-center text-action">
                        <Shield size={16} strokeWidth={2} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Premium Service</span>
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-serif text-primary mb-8 leading-tight max-w-xl mx-auto">{service.heading}</h1>
                  
                  <div className="prose prose-sm font-sans max-w-2xl mx-auto leading-relaxed tracking-wide text-gray-600 mb-12 text-center">
                     {service.longDescription.split('\n').map((para, i) => (
                        <p key={i} className={para.trim() ? "mb-6 text-base" : ""}>{para}</p>
                     ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-y border-gray-100 mb-12">
                     <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                           <CheckCircle size={18} className="text-action" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Expert Care</span>
                     </div>
                     <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                           <CheckCircle size={18} className="text-action" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Precision Fit</span>
                     </div>
                     <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                           <CheckCircle size={18} className="text-action" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Global Std</span>
                     </div>
                     <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                           <CheckCircle size={18} className="text-action" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Support</span>
                     </div>
                  </div>

                  <Link 
                     to="/contact"
                     className="inline-block bg-primary text-white text-center py-4 px-12 rounded-full text-xs font-bold uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95 shadow-primary/10"
                  >
                     Enquire for Service
                  </Link>
               </motion.div>
            </div>
         </div>
      </div>
    );
};

export default ServiceDetail;
