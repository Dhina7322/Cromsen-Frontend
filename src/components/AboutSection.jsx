import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="z-10 relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=2070&auto=format&fit=crop" 
                alt="Interior Design" 
                className="w-full h-[600px] object-cover"
              />
            </motion.div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 -z-0 hidden md:block"></div>
          </div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:pl-8 lg:pr-12"
          >
            <span className="text-action lowercase font-serif italic text-lg mb-4 block">Quality</span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-[1.2] text-primary">Quality Blinds And Curtains From Local Family Run Business</h2>
            <p className="text-gray-600 leading-relaxed mb-8 font-light text-sm">
              We are a local family run business with 50 years of experience 
              in providing highest quality window treatments. From measure 
              to install, our experts are here to give you the best possible 
              solution for your home.
            </p>
            <button className="px-8 py-3 border border-gray-300 text-neutral-dark hover:border-action hover:text-action transition-all text-xs tracking-[0.2em] font-sans font-bold uppercase">
              Learn more about us
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
