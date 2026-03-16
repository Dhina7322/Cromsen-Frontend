import { motion } from 'framer-motion';

const RoleSelector = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-primary flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 p-12 rounded-2xl flex flex-col items-center text-center group hover:bg-white/10 transition-all cursor-pointer"
          onClick={() => onSelect('customer')}
        >
          <div className="w-20 h-20 rounded-full bg-action/20 flex items-center justify-center mb-8 border border-action/30 group-hover:scale-110 transition-transform">
             <div className="w-10 h-10 rounded-full bg-action" />
          </div>
          <h2 className="text-3xl font-serif text-white mb-4">Retail Customer</h2>
          <p className="text-gray-400 font-light leading-relaxed">
            I am shopping for my personal home or office. Show me standard luxury pricing.
          </p>
          <button className="mt-10 px-8 py-3 bg-white text-primary font-bold uppercase tracking-widest text-xs rounded-full group-hover:bg-action group-hover:text-white transition-colors">
            Enter Store
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 p-12 rounded-2xl flex flex-col items-center text-center group hover:bg-white/10 transition-all cursor-pointer"
          onClick={() => onSelect('dealer')}
        >
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-8 border border-purple-500/30 group-hover:scale-110 transition-transform">
             <div className="w-10 h-10 rounded-full bg-purple-500" />
          </div>
          <h2 className="text-3xl font-serif text-white mb-4">Dealer / Wholesale</h2>
          <p className="text-gray-400 font-light leading-relaxed">
            I am a registered dealer or interior professional. Show me wholesale pricing.
          </p>
          <button className="mt-10 px-8 py-3 bg-white text-primary font-bold uppercase tracking-widest text-xs rounded-full group-hover:bg-purple-500 group-hover:text-white transition-colors">
            Enter Portal
          </button>
        </motion.div>
      </div>
      
      <div className="absolute bottom-12 left-0 right-0 text-center flex flex-col items-center gap-4">
         <h1 className="text-white font-brand text-2xl tracking-[0.4em] uppercase opacity-50">Cromsen</h1>
         <button 
           onClick={() => onSelect('admin')}
           className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
         >
           Access Admin Portal
         </button>
      </div>
    </div>
  );
};

export default RoleSelector;
