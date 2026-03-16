import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroImage from '../assets/services_hero.png';

const services = [
  {
    title: "Blinds",
    description: "Blinds offer a sleek and practical window solution, providing precise light control, privacy, and modern style.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Installation",
    description: "Professional installation ensures a perfect fit, secure setup, and flawless performance for your curtains and blinds.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Curtains & Drapery",
    description: "Curtains & drapery enhance your space with elegance, comfort, and refined light control for a stylish interior.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop"
  },
  {
    title: "Stylish Sitting Room Curtains",
    description: "Stylish sitting room curtains that add elegance, comfort, and a modern touch to your living space.",
    image: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=2000&auto=format&fit=crop"
  },
  {
    title: "Contemporary Bedroom Blinds",
    description: "Contemporary bedroom blinds offer a sleek, modern look while providing perfect light control and privacy.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "White Fitted Window Shutters",
    description: "White fitted window shutters add a timeless, elegant look while offering excellent light control and privacy for any space.",
    image: "https://images.unsplash.com/photo-1523413363574-c3c444a1183d?q=80&w=2000&auto=format&fit=crop"
  },
  {
    title: "Cleaning & Repair",
    description: "Maintain the beauty and functionality of your window treatments with our expert cleaning and repair services.",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Over 40 Years in Business",
    description: "Over 40 years in business, delivering trusted expertise, quality craftsmanship, and reliable service you can count on.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
  }
];

const Services = () => {
  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={HeroImage} 
            alt="Services Hero" 
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif text-white mb-4 tracking-tight"
          >
            All Services
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-gray-300 uppercase tracking-[0.2em] text-xs font-medium"
          >
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span>All Services</span>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto max-w-[1200px] px-5 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[4/3] overflow-hidden mb-6 rounded-sm shadow-sm">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
              </div>
              
              <h3 className="text-2xl font-serif text-primary mb-4 leading-tight">
                {service.title}
              </h3>
              
              <p className="text-gray-500 text-[13px] leading-relaxed mb-6 font-sans">
                {service.description}
              </p>
              
              <Link 
                to="/contact" 
                className="inline-block bg-action text-white text-[11px] uppercase tracking-widest font-bold py-3.5 px-8 hover:bg-primary transition-all duration-300 rounded-sm"
              >
                Learn more
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pagination Dummy */}
        <div className="mt-20 flex justify-center space-x-2">
          <button className="w-10 h-10 flex items-center justify-center bg-action text-white text-xs font-bold rounded-sm">1</button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-200 text-gray-400 text-xs font-bold hover:bg-gray-50 transition-colors rounded-sm">2</button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-200 text-gray-400 text-xs font-bold hover:bg-gray-50 transition-colors rounded-sm">3</button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-200 text-gray-400 text-xs font-bold hover:bg-gray-50 transition-colors rounded-sm">&gt;</button>
        </div>
      </section>
    </div>
  );
};

export default Services;
