import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Interior Designer",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Cromsen has been our go-to for all our high-end projects. Their attention to detail and quality of fabrics is unmatched in the region."
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Homeowner",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "The custom blinds fit perfectly and the automated system is a game changer. Exceptional service from measurement to installation."
  },
  {
    id: 3,
    name: "Emma Williams",
    role: "Architect",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "We've specified Cromsen's drapery hardware for multiple commercial projects. Reliable, durable, and aesthetically stunning products."
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-primary text-white overflow-hidden">
      <div className="container mx-auto px-5 max-w-[1200px]">
        <div className="text-white text-xs tracking-[0.2em] font-sans uppercase mb-6 font-bold text-center">Testimonials</div>
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-16 max-w-2xl mx-auto italic">
          What our clients have to say about our premium window treatments.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((test, idx) => (
            <motion.div 
              key={test.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-action transition-colors duration-500">
                  <img src={test.image} alt={test.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-action text-white p-2 rounded-full shadow-lg">
                  <Quote size={12} fill="currentColor" />
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed font-light mb-8 italic text-sm md:text-base">
                "{test.content}"
              </p>
              
              <div className="mt-auto">
                <h4 className="text-white font-sans font-bold uppercase tracking-widest text-xs mb-1">
                  {test.name}
                </h4>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">
                  {test.role}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
