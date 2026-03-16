import AboutSection from '../components/AboutSection';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="pt-20">
      {/* Page Header */}
      <section className="bg-primary/5 py-32 text-center">
        <div className="container mx-auto max-w-[1200px] px-5">
          <span className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">Elegance in Every Thread</span>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight">Our Story</h1>
        </div>
      </section>

      <AboutSection />

      {/* Services Section */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif">What we offer</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Custom Measurement', desc: 'We provide professional on-site measurements to ensure a perfect fit for every window.' },
              { title: 'Premium Fabrics', desc: 'Our collection includes thousands of exclusive fabrics from the world\'s best mills.' },
              { title: 'Expert Installation', desc: 'Our skilled technicians handle the complete installation with precision and care.' }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-12 text-center group hover:bg-neutral-dark transition-colors duration-500"
              >
                <h3 className="text-xl font-serif mb-6 group-hover:text-white transition-colors">{service.title}</h3>
                <p className="text-gray-500 font-light group-hover:text-gray-300 transition-colors leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Philosophy Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto max-w-[1200px] px-5 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-serif mb-8">Our Philosophy</h2>
            <p className="text-gray-600 leading-relaxed mb-6 italic text-xl">
              "We don't just sell window treatments; we create atmosphere."
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 font-light text-lg">
              At Cromsen, we believe that luxury is not just about price—it's about the feeling of quality, the precision of craftsmanship, and the beauty of a well-designed space. We are dedicated to helping our clients express their unique style through our bespoke collections.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop" alt="Work" className="w-full h-64 object-cover" />
              <img src="https://images.unsplash.com/photo-1616489953149-8ba5dc422934?q=80&w=2070&auto=format&fit=crop" alt="Design" className="w-full h-64 object-cover mt-8" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
