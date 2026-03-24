import { motion } from 'framer-motion';

const RoleSelector = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-primary flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-2xl w-full flex flex-col items-center">
        {/* Logo Block */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-8 md:pt-0"
        >
          <div className="flex items-center justify-center gap-5 mb-6 group">
             <div className="w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform cursor-pointer">
               <img src="/favicon1.png" alt="" className="w-full h-full object-contain drop-shadow-2xl" />
             </div>
             <div className="text-left">
               <h3 className="text-white text-3xl font-brand font-black uppercase tracking-[0.25em]">Cromsen</h3>
               <p className="text-white/50 text-[10px] font-black uppercase tracking-[1.65em] -mt-1">Importers</p>
             </div>
          </div>

          <h1 className="text-white text-lg md:text-xl font-serif mb-2 tracking-wide opacity-80">Welcome. Select your portal.</h1>
          <p className="text-white/30 text-[9px] font-black max-w-sm mx-auto leading-relaxed uppercase tracking-[0.2em] opacity-40">
            Secure Trade & Retail Access.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-8 rounded-3xl flex flex-col items-center text-center group hover:bg-white/10 transition-all cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            onClick={() => onSelect('customer')}
          >
            <div className="w-12 h-12 rounded-full bg-action/10 flex items-center justify-center mb-6 border border-action/20 group-hover:scale-110 transition-transform">
               <div className="w-6 h-6 rounded-full bg-action shadow-lg shadow-action/40 animate-pulse" />
            </div>
            <h2 className="text-xl font-serif text-white mb-3 tracking-[0.1em] uppercase">Retailer</h2>
            <p className="text-gray-500 text-[10px] font-bold leading-relaxed px-4 uppercase tracking-widest leading-6 opacity-70">
              Personal Shopping <br /> Standard Pricing
            </p>
            <button className="mt-8 px-10 py-3 bg-white text-primary font-black uppercase tracking-[0.15em] text-[9px] rounded-full group-hover:bg-action group-hover:text-white transition-all active:scale-95 shadow-2xl">
              Enter Store
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-8 rounded-3xl flex flex-col items-center text-center group hover:bg-white/10 transition-all cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            onClick={() => onSelect('dealer')}
          >
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
               <div className="w-6 h-6 rounded-full bg-purple-500 shadow-lg shadow-purple-500/40" />
            </div>
            <h2 className="text-xl font-serif text-white mb-3 tracking-[0.1em] uppercase">Dealer</h2>
            <p className="text-gray-500 text-[10px] font-bold leading-relaxed px-4 uppercase tracking-widest leading-6 opacity-70">
               Trade Portal <br /> Wholesale Pricing
            </p>
            <button className="mt-8 px-10 py-3 bg-white text-primary font-black uppercase tracking-[0.15em] text-[9px] rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all active:scale-95 shadow-2xl">
              Enter Portal
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
