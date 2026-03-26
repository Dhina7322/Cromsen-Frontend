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

           {/* Post-style centered layout */}
           <div className="max-w-4xl mx-auto">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="mb-16"
              >
                 <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl shadow-black/10 border border-gray-100">
                    <img 
                       src={getImageUrl(service.image)} 
                       alt={service.heading} 
                       className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                 </div>
              </motion.div>

              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="px-5 md:px-0 text-center"
              >
                 <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-action/10 rounded-xl flex items-center justify-center text-action">
                       <Shield size={20} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Premium Service Offering</span>
                 </div>

                 <h1 className="text-5xl lg:text-7xl font-serif text-primary mb-12 leading-tight max-w-2xl mx-auto">{service.heading}</h1>
                 
                 <div className="prose prose-lg font-sans max-w-3xl mx-auto leading-relaxed tracking-wide text-gray-600 mb-20 text-center">
                    {service.longDescription.split('\n').map((para, i) => (
                       <p key={i} className={para.trim() ? "mb-8 text-lg" : ""}>{para}</p>
                    ))}
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-gray-100 mb-20">
                    <div className="flex flex-col items-center gap-3">
                       <CheckCircle size={24} className="text-action" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Expert Care</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                       <CheckCircle size={24} className="text-action" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Precision Fit</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                       <CheckCircle size={24} className="text-action" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Global Std</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                       <CheckCircle size={24} className="text-action" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Support</span>
                    </div>
                 </div>

                 <Link 
                    to="/contact"
                    className="inline-block bg-primary text-white text-center py-6 px-16 rounded-full text-xs font-bold uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-95 shadow-primary/20"
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
