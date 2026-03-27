import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPolicies } from '../services/api';
import Logo from '../assets/cromsen.png';
import ServicesSection from './ServicesSection';

const Footer = () => {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await getPolicies();
        const activePolicies = data.filter(p => p.isActive);
        setPolicies(activePolicies);
      } catch (err) {
        console.error("Footer policies load failed", err);
      }
    };
    fetchPolicies();
  }, []);

  return (
    <>
      <div className="w-full bg-white">
        <div className="container mx-auto max-w-[1200px] px-5">
          {/* Dynamic Scrolling Services Section (Replaces static gallery) */}
          <ServicesSection isFooterView={true} />

          {/* Main Footer */}
          <footer className="pt-20 pb-10 flex flex-col items-center">
            {/* Contact Row */}
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 mb-16 px-4">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#f57322] font-bold mb-1">Email</span>
                <a href="mailto:cromsen@gmail.com" className="text-primary font-serif text-lg">cromsen@gmail.com</a>
              </div>

              <div className="flex flex-col items-center shrink-0">
                <img src={Logo} alt="Cromsen Importers" className="h-12 w-auto object-contain" />
              </div>

              <div className="flex flex-col items-center md:items-end text-center md:text-right">
                <span className="text-[10px] uppercase tracking-widest text-[#f57322] font-bold mb-1">Phone</span>
                <a href="tel:9944431314" className="text-primary font-serif text-lg">99444 31314</a>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 mb-8" />

            <div className="w-full flex flex-col items-center md:items-start gap-6">
              <div className="relative pb-2 flex flex-col items-center md:items-start text-center md:text-left">
                <h3 className="text-xl font-medium text-[#0089d1] font-sans capitalize tracking-tight">Policy</h3>
                <div className="w-12 h-0.5 bg-[#e67e22] mt-1" />
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-800">
                {policies.length > 0 ? (
                  policies.map((p, idx) => (
                    <React.Fragment key={p._id}>
                      <Link to={`/${p.slug}`} className="hover:text-action transition-colors">{p.title}</Link>
                      {idx < policies.length - 1 && <div className="hidden md:block w-px h-3 bg-gray-300" />}
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <Link to="/privacy-policy" className="hover:text-action transition-colors">Privacy Policy</Link>
                    <div className="hidden md:block w-px h-3 bg-gray-300" />
                    <Link to="/terms-conditions" className="hover:text-action transition-colors">Terms & Conditions</Link>
                    <div className="hidden md:block w-px h-3 bg-gray-300" />
                    <Link to="/return-refund-policy" className="hover:text-action transition-colors">Shipping & Returns</Link>
                  </>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="bg-primary text-center py-4 text-white text-xs uppercase tracking-[0.2em] opacity-90">
        <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Cromsen. Developed by <a href="https://madhuratech.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color: '#f57322' }}>Madhura Technologies</a>.
        </div>
      </div>
    </>
  );
};

export default Footer;
