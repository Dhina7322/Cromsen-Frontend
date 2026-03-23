import { Link } from 'react-router-dom';
import Logo from '../assets/cromsen.png';

const Footer = () => {
  return (
    <>
      <div className="w-full bg-white">
        <div className="container mx-auto max-w-[1200px] px-5">
          {/* Pre-Footer Image Gallery */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 py-1">

            {/* Curtains - actual curtain/drape on window */}
            <div className="relative h-48 group overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?q=80&w=800&auto=format&fit=crop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Curtains"
              />
              <div className="absolute inset-x-0 bottom-4 text-center">
                <span className="bg-white/90 text-neutral-dark text-[10px] uppercase tracking-widest px-4 py-2 font-black shadow-sm group-hover:bg-action group-hover:text-white transition-colors">Curtains</span>
              </div>
            </div>

            {/* Window Blinds - actual blinds on a window */}
            <div className="relative h-48 group overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Window Blinds"
              />
              <div className="absolute inset-x-0 bottom-4 text-center">
                <span className="bg-white/90 text-neutral-dark text-[10px] uppercase tracking-widest px-4 py-2 font-black shadow-sm group-hover:bg-action group-hover:text-white transition-colors">Window Blinds</span>
              </div>
            </div>

            {/* Drapery Hardware - curtain rods and rings */}
            <div className="relative h-48 group overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Drapery Hardware"
              />
              <img src="https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Drapery Hardware" />
              <div className="absolute inset-x-0 bottom-4 text-center">
                <span className="bg-white/90 text-neutral-dark text-[10px] uppercase tracking-widest px-4 py-2 font-black shadow-sm group-hover:bg-action group-hover:text-white transition-colors">Drapery Hardware</span>
              </div>
            </div>

            {/* Outdoor Screens - outdoor patio with screen/shade */}
            <div className="relative h-48 group overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=800&auto=format&fit=crop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Outdoor Screens"
              />
              <div className="absolute inset-x-0 bottom-4 text-center">
                <span className="bg-white/90 text-neutral-dark text-[10px] uppercase tracking-widest px-4 py-2 font-black shadow-sm group-hover:bg-action group-hover:text-white transition-colors">Outdoor Screens</span>
              </div>
            </div>

          </div>

          {/* Main Footer */}
          <footer className="pt-20 pb-10 flex flex-col items-center">
            {/* Contact Row */}
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 mb-16 px-4">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[10px] uppercase tracking-widest text-action font-bold mb-1">Email</span>
                <a href="mailto:cromsen@gmail.com" className="text-primary font-serif text-lg">cromsen@gmail.com</a>
              </div>

              <div className="flex flex-col items-center shrink-0">
                <img src={Logo} alt="Cromsen Importers" className="h-12 w-auto object-contain" />
              </div>

              <div className="flex flex-col items-center md:items-end text-center md:text-right">
                <span className="text-[10px] uppercase tracking-widest text-action font-bold mb-1">Phone</span>
                <a href="tel:9944431314" className="text-primary font-serif text-lg">99444 31314</a>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 mb-8" />

            <div className="w-full flex flex-col items-start gap-6">
              <div className="relative pb-2 flex flex-col items-start text-left">
                <h3 className="text-xl font-medium text-[#0089d1] font-sans capitalize tracking-tight">Policy</h3>
                <div className="w-12 h-0.5 bg-[#e67e22] mt-1" />
              </div>
              <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-4 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-800">
                <Link to="/privacy-policy" className="hover:text-action transition-colors">Privacy Policy</Link>
                <div className="hidden md:block w-px h-3 bg-gray-300" />
                <Link to="/terms-conditions" className="hover:text-action transition-colors">Terms & Conditions</Link>
                <div className="hidden md:block w-px h-3 bg-gray-300" />
                <Link to="/return-refund-policy" className="hover:text-action transition-colors">Return & Refund Policy</Link>
                <div className="hidden md:block w-px h-3 bg-gray-300" />
                <Link to="/shipping-policy" className="hover:text-action transition-colors">Shipping Policy</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="bg-primary text-center py-4 text-white text-xs uppercase tracking-[0.2em] opacity-90">
        <div className="container mx-auto max-w-[1200px] px-5">
          &copy; {new Date().getFullYear()} Cromsen. Developed by <a href="https://madhuratech.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color: '#f57322' }}>Madhura Technologies</a>.
        </div>
      </div>
    </>
  );
};

export default Footer;