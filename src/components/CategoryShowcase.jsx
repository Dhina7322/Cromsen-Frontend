import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { getCategories } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const CategoryShowcase = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (loading || categories.length === 0) return null;
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-[1200px] px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-neutral-dark mb-4 tracking-wide">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {categories.slice(0, 10).map((cat, idx) => (
            <Link 
              key={cat._id || cat.name || idx} 
              to={`/shop?category=${cat._id || cat.name}`}
              className="group flex flex-col items-center text-center w-full"
            >
              <div className="w-full aspect-square mb-4 overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                {cat.image ? (
                  <img 
                    src={getImageUrl(cat.image)} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center text-gray-400 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl font-serif">{cat.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3 className="text-xs font-sans font-bold tracking-wide text-neutral-dark group-hover:text-action transition-colors">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
