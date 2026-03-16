import HeroSection from '../components/Hero';
import CategoryShowcase from '../components/CategoryShowcase';
import FeaturedProducts from '../components/FeaturedProducts';
import AboutSection from '../components/AboutSection';
import ServiceFeatures from '../components/ServiceFeatures';
import KeyFactors from '../components/KeyFactors';
import Contact from './Contact'; // We will include a portion of Contact on the home page

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <CategoryShowcase />
      <AboutSection />
      <ServiceFeatures />
      <KeyFactors />
      <FeaturedProducts />
      
      {/* Subscribe Section */}
      <section className="py-24 bg-primary text-white text-center flex flex-col items-center">
        <div className="container mx-auto px-5 max-w-[1200px]">
          <div className="text-white text-xs tracking-[0.2em] font-sans uppercase mb-6 font-bold">Subscribe</div>
          <p className="text-xl md:text-2xl font-serif leading-relaxed mb-10 w-2/3 mx-auto text-gray-300">
            Receive special offers & updates via email. You will receive an email shortly to confirm your subscription.
          </p>
          
          <form className="flex w-full max-w-md mx-auto mb-16">
            <input 
              type="email" 
              placeholder="Your email" 
              className="bg-transparent border-b border-white px-4 py-3 text-sm flex-grow focus:outline-none focus:border-action transition-colors text-white text-center"
            />
            <button className="bg-action text-white px-6 py-3 text-sm font-sans uppercase tracking-[0.2em] font-bold shadow-md hover:bg-white hover:text-primary transition-colors">Join</button>
          </form>

          <div className="flex justify-center space-x-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Team" className="w-full h-full object-cover grayscale opacity-80" />
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent relative -top-2 scale-110 z-10">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Team" className="w-full h-full object-cover grayscale" />
            </div>
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent">
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Team" className="w-full h-full object-cover grayscale opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Head Office Map Section (Simplified from reference layout) */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto max-w-[1200px] px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-action lowercase font-serif italic text-lg mb-4 block">Contact</span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-primary">Cromsen Head Office</h2>
            <p className="text-gray-600 leading-relaxed mb-8 font-light text-sm">
              We have a showroom that is to the public, however please call us to make an appointment so we can have a consultant available.
            </p>
            <ul className="space-y-4 text-sm text-neutral-dark">
              <li className="flex items-start">
                <span className="text-action mr-3 mt-1">✓</span>
                <span>Unit 1 / 18-20 Wenham Court<br/>Boronia, Melbourne, Victoria, Australia</span>
              </li>
              <li className="flex items-center">
                <span className="text-action mr-3">✓</span>
                <span>(61) 3 8398 9000</span>
              </li>
              <li className="flex items-center">
                <span className="text-action mr-3">✓</span>
                <span>sales@cromsen.com.au</span>
              </li>
            </ul>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" alt="Map" className="w-full h-80 object-cover rounded-lg shadow-sm" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
