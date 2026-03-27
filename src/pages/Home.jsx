import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';
import ProductSection from '../components/ProductSection';
import ServiceFeatures from '../components/ServiceFeatures';
import KeyFactors from '../components/KeyFactors';
import { MapPin, AtSign, Phone, RefreshCw } from 'lucide-react';
import Testimonials from '../components/Testimonials';
import ServicesSection from '../components/ServicesSection';
import { getHomepageConfig } from '../services/api';

const Home = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getHomepageConfig();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load homepage config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <RefreshCw className="animate-spin text-action" size={40} />
      </div>
    );
  }

  // Fallback if config failed or is empty
  const displayConfig = config || {
    showHero: true,
    showCategories: true,
    showPopular: true,
    showFeatured: true,
    showCustomSection: false
  };

  return (
    <div className="overflow-x-hidden">
      {displayConfig.showHero && <HeroSection />}
      
      {displayConfig.showCategories && (
        <CategoryShowcase initialItems={displayConfig.selectedCategories} />
      )}

      <ServiceFeatures />
      <KeyFactors />

      {displayConfig.showPopular && (
        <ProductSection 
          label="Shop" 
          title="Popular Right Now" 
          initialProducts={displayConfig.popularProducts}
          bgColor="bg-white"
        />
      )}
      
      {displayConfig.showFeatured && (
        <ProductSection 
          label="Premium" 
          title="Featured Collection" 
          initialProducts={displayConfig.featuredProducts}
          bgColor="bg-secondary"
        />
      )}

      {displayConfig.showCustomSection && (
        <ProductSection 
          label="Collection" 
          title={displayConfig.customSectionTitle || "Our Favorites"} 
          initialProducts={displayConfig.customSectionProducts}
          bgColor="bg-white"
        />
      )}
      
      <Testimonials />
      
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto max-w-[1200px] px-5 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
            {/* Header */}
            <div>
              <span className="text-action font-sans text-xl mb-2 block font-medium">Contact</span>
              <hr className="w-12 border-t-2 border-action mb-6" />
            </div>

            {/* Addresses Stack */}
            <div className="space-y-10 max-w-lg">
              {/* Head Office */}
              <div className="group">
                <h3 className="text-2xl font-serif mb-4 leading-tight text-primary font-black flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-action">
                    <MapPin size={18} />
                  </div>
                  Cromsen Head Office
                </h3>
                <a 
                  href="https://maps.google.com/maps?q=164,%20Trichy%20Rd,%20opp.%20Ocean%20Restaurent,%20Selvaraja%20Puram,%20Coimbatore,%20Kannampalayam,%20Tamil%20Nadu%20641103"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 leading-relaxed font-light text-sm hover:text-action transition-colors block pl-11"
                >
                  No. 164, Trichy Road, Opposite Ocean Restaurant,<br/>Selvarajapuram, Coimbatore - 641103.
                </a>
              </div>

              {/* Manufacturing Unit */}
              <div className="group">
                <h3 className="text-2xl font-serif mb-4 leading-tight text-primary font-black flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-action">
                    <MapPin size={18} />
                  </div>
                  Manufacturing Unit
                </h3>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=2,+Kallanthottam,+Kannampalayam,+Coimbatore,+TAMIL+NADU+641402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 leading-relaxed font-light text-sm hover:text-action transition-colors block pl-11"
                >
                  2, Kallanthottam, Kannampalayam<br/>Coimbatore, TAMIL NADU, 641402
                </a>
              </div>
            </div>

            {/* Contact Details */}
            <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row gap-8">
              <div className="flex items-center group">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-action mr-4 group-hover:bg-action group-hover:text-white transition-all">
                  <AtSign size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Email</span>
                  <a href="mailto:cscromsen@gmail.com" className="text-sm text-gray-700 font-medium hover:text-action">cscromsen@gmail.com</a>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-action mr-4 group-hover:bg-action group-hover:text-white transition-all">
                  <Phone size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Phone</span>
                  <a href="tel:9842233645" className="text-sm text-gray-700 font-medium hover:text-action">+91-98422 33645, 99444 30314</a>
                </div>
              </div>
            </div>

            <p className="text-gray-500 leading-relaxed font-light text-xs opacity-70 border-l-2 border-action pl-6 italic">
              Cromsen is a registered partnership business involved in importing, wholesaling, and supplying various home improvement products.
            </p>
          </div>

          <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white grayscale-[20%] hover:grayscale-0 transition-all duration-700">
            <iframe 
              src="https://maps.google.com/maps?q=164,%20Trichy%20Rd,%20opp.%20Ocean%20Restaurent,%20Selvaraja%20Puram,%20Coimbatore,%20Kannampalayam,%20Tamil%20Nadu%20641103&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              className="w-full h-full border-0" 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
