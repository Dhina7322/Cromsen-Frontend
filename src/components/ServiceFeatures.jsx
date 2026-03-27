import { PenTool, Home, CheckCircle } from 'lucide-react';

const ServiceFeatures = () => {
  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3">
          
          <div className="flex flex-col items-center text-center p-12 border border-gray-100">
            <div className="text-action mb-6">
              <PenTool size={32} />
            </div>
            <h3 className="text-lg font-serif mb-4 text-neutral-dark">Made to Measure</h3>
            <p className="text-sm font-light text-gray-500 leading-relaxed">
              With 50 Years Of Experience we have the product knowledge to make sure you get exactly what you need.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-12 bg-primary text-white border border-primary">
            <div className="text-white mb-6">
              <Home size={32} />
            </div>
            <h3 className="text-lg font-serif mb-4">In-home consultations</h3>
            <p className="text-sm font-light text-gray-300 leading-relaxed">
              We will bring the showroom to your home and offer a free consultation to show you the range.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-12 border border-gray-100">
            <div className="text-action mb-6">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-serif mb-4 text-neutral-dark">We Do It All For You</h3>
            <p className="text-sm font-light text-gray-500 leading-relaxed">
              From measure to installation we will manage the full process for you.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceFeatures;
