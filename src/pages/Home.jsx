import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';
import FeaturedProducts from '../components/FeaturedProducts';
import AboutSection from '../components/AboutSection';
import ServiceFeatures from '../components/ServiceFeatures';
import KeyFactors from '../components/KeyFactors';
import Contact from './Contact'; // We will include a portion of Contact on the home page
import { MapPin, AtSign, Phone } from 'lucide-react';

const Home = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Joseph',
      quote: "The made-to-measure curtains are beautifully crafted and fit perfectly in our home. Excellent quality and professional service from start to finish.",
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      quote: "I am extremely impressed with the quality of the mosquito nets. They are practically invisible and work perfectly. Highly recommend Cromsen for their professional installation.",
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      quote: "The team was very helpful in choosing the right blinds for my office. The installation was quick and clean. The dynamic design added a premium feel to my workspace.",
      image: 'https://randomuser.me/api/portraits/men/46.jpg'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <CategoryShowcase />
      <AboutSection />
      <ServiceFeatures />
      <KeyFactors />
      <FeaturedProducts />
      
      {/* Testimonials Section */}
      <section className="py-24 bg-primary text-white text-center flex flex-col items-center relative overflow-hidden">
        <div className="container mx-auto px-5 max-w-[1200px] z-10">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-2xl font-sans font-medium mb-3 tracking-wide">Testimonials</h2>
            <div className="w-10 h-1 border-t-2 border-action"></div>
          </div>

          <div className="relative h-[250px] md:h-[200px] flex items-center justify-center mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-gray-300 mb-8 px-4">
                  “{testimonials[activeIndex].quote}”
                </p>
                <div className="text-lg font-sans text-gray-400 font-medium">
                  {testimonials[activeIndex].name}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center space-x-6">
            {testimonials.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-500 rounded-full overflow-hidden border-2 ${
                  activeIndex === idx 
                    ? 'w-20 h-20 border-action scale-110 z-20 shadow-xl' 
                    : 'w-14 h-14 border-transparent grayscale opacity-50 scale-90 hover:opacity-80'
                }`}
              >
                <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
           <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-action rounded-full blur-[100px] -translate-y-1/2"></div>
           <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-action rounded-full blur-[100px] -translate-y-1/2"></div>
        </div>
      </section>

      {/* Head Office Map Section (Simplified from reference layout) */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto max-w-[1200px] px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#3498db] font-sans text-xl mb-2 block">Contact</span>
            <hr className="w-12 border-t-2 border-[#e67e22] mb-6" />
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-primary">Cromsen Head Office</h2>
            <p className="text-gray-600 leading-relaxed mb-8 font-light text-sm">
              Cromsen is a registered partnership business involved in importing, wholesaling, and supplying various home improvement products, including stainless steel mosquito nets, PVC doors, and aluminium mesh.
            </p>
            <ul className="space-y-6 text-sm text-neutral-dark mt-8">
              <li className="flex items-start">
                <MapPin className="text-[#3498db] mr-4 mt-1 flex-shrink-0" size={20} />
                <span className="text-base text-gray-700">No. 164, Trichy Road, Opposite Ocean Restaurant,<br/>Selvarajapuram, Coimbatore - 641103.</span>
              </li>
              <li className="flex items-center">
                <AtSign className="text-[#3498db] mr-4 flex-shrink-0" size={20} />
                <span className="text-base text-gray-700">cscromsen@gmail.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="text-[#3498db] mr-4 flex-shrink-0" size={20} />
                <span className="text-base text-gray-700">+91-98422 33645, 99444 30314</span>
              </li>
            </ul>
          </div>
          <div className="h-[400px]">
            <iframe 
              src="https://maps.google.com/maps?q=164,%20Trichy%20Rd,%20opp.%20Ocean%20Restaurent,%20Selvaraja%20Puram,%20Coimbatore,%20Kannampalayam,%20Tamil%20Nadu%20641103&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              className="w-full h-full rounded-lg shadow-sm border-0" 
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
