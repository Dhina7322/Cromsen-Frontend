import HeroSection from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';
import FeaturedProducts from '../components/FeaturedProducts';
import AboutSection from '../components/AboutSection';
import ServiceFeatures from '../components/ServiceFeatures';
import KeyFactors from '../components/KeyFactors';
import Testimonials from '../components/Testimonials';
import Contact from './Contact'; // We will include a portion of Contact on the home page
import { MapPin, AtSign, Phone } from 'lucide-react';

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <CategoryShowcase />
      <AboutSection />
      <ServiceFeatures />
      <KeyFactors />
      <FeaturedProducts />
      
      {/* Testimonials Section */}
      <Testimonials />

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
