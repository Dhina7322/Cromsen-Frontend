import React from 'react';
import { useParams, Link } from 'react-router-dom';

const PolicyPage = () => {
  const { type } = useParams();
  
  const policies = {
    'privacy-policy': {
      title: 'Privacy Policy',
      content: 'At Cromsen, we are committed to protecting your privacy. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our site.'
    },
    'terms-conditions': {
      title: 'Terms & Conditions',
      content: 'Welcome to Cromsen. By accessing this website we assume you accept these terms and conditions. Do not continue to use Cromsen if you do not agree to take all of the terms and conditions stated on this page.'
    },
    'return-refund-policy': {
      title: 'Return & Refund Policy',
      content: 'Our policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately we can\'t offer you a refund or exchange. To be eligible for a return, your item must be unused and in the same condition that you received it.'
    },
    'shipping-policy': {
      title: 'Shipping Policy',
      content: 'We offer various shipping methods for our products. Shipping costs are calculated during checkout based on weight, dimensions and destination. Delivery times may vary depending on the shipping method selected and your location.'
    }
  };

  const policy = policies[type] || policies['privacy-policy'];

  return (
    <div className="pt-40 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-[900px] px-5">
        <div className="bg-white p-10 md:p-16 shadow-xl rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-[2px] w-8 bg-action"></span>
            <span className="text-action uppercase tracking-[0.3em] text-[10px] font-black">Legal Info</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-10 leading-tight">{policy.title}</h1>
          <div className="prose prose-neutral max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed mb-8 italic">
              {policy.content}
            </p>
            <div className="space-y-6 text-gray-500 font-light leading-relaxed">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <h2 className="text-2xl font-serif text-primary pt-8 pb-2">1. Introduction</h2>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
                totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
              <h2 className="text-2xl font-serif text-primary pt-8 pb-2">2. Liability</h2>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores 
                eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, 
                consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam 
                quaerat voluptatem.
              </p>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
             <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                Back to Store
             </Link>
             <span className="text-[10px] text-gray-300 uppercase font-bold tracking-widest">Last Updated: March 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
