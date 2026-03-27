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
      <ServicesSection />

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

      {/* Head Office Map Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-action font-sans text-xl mb-2 block font-medium">Contact</span>
            <hr className="w-12 border-t-2 border-action mb-6" />
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-primary">Cromsen Head Office</h2>
            <p className="text-gray-600 leading-relaxed mb-8 font-light text-sm">
              Cromsen is a registered partnership business involved in importing, wholesaling, and supplying various home improvement products, including stainless steel mosquito nets, PVC doors, and aluminium mesh.
            </p>
            <ul className="space-y-6 text-sm text-neutral-dark mt-8">
              <li className="flex items-start">
                <MapPin className="text-action mr-4 mt-1 flex-shrink-0" size={20} />
                <span className="text-base text-gray-700 font-medium">No. 164, Trichy Road, Opposite Ocean Restaurant,<br/>Selvarajapuram, Coimbatore - 641103.</span>
              </li>
              <li className="flex items-center">
                <AtSign className="text-action mr-4 flex-shrink-0" size={20} />
                <span className="text-base text-gray-700 font-medium">cscromsen@gmail.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="text-action mr-4 flex-shrink-0" size={20} />
                <span className="text-base text-gray-700 font-medium">+91-98422 33645, 99444 30314</span>
              </li>
            </ul>
          </div>
          <div className="h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
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
