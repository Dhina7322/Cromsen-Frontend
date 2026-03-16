import { Shield, Home, Settings, Clock, ThumbsUp, PenTool } from 'lucide-react';

const KeyFactors = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-[1200px] px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="lg:pr-12">
            <span className="text-action lowercase font-serif italic text-lg mb-4 block">Features</span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-[1.2] text-primary">When Quality, Reliability And Service Are The Key Factors</h2>
            <p className="text-gray-600 leading-relaxed mb-12 font-light text-sm">
              We offer a huge range of curtains and blinds in our showroom.
              Each product is custom made to your specific window sizes.
              Choosing the right window coverings is a breeze with our
              free no obligation quoting and measuring service.
            </p>

            <div className="grid grid-cols-3 gap-8 text-action">
              <div className="flex justify-center"><Shield size={40} className="stroke-1" /></div>
              <div className="flex justify-center"><Home size={40} className="stroke-1" /></div>
              <div className="flex justify-center"><Settings size={40} className="stroke-1" /></div>
              <div className="flex justify-center"><Clock size={40} className="stroke-1" /></div>
              <div className="flex justify-center"><ThumbsUp size={40} className="stroke-1" /></div>
              <div className="flex justify-center"><PenTool size={40} className="stroke-1" /></div>
            </div>
          </div>

          <div className="flex flex-col gap-4 relative">
            <img 
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop" 
              alt="Window Coverings" 
              className="w-full h-64 object-cover"
            />
            {/* Using a placeholder for the floral/leaf pattern seen in reference */}
            <div className="w-full h-40 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-70">
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default KeyFactors;
