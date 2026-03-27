import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getProducts({ featured: true });
        setProducts(data.products || data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) return null;

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 px-4">
          <span className="text-action lowercase font-serif italic text-lg mb-2 block">Shop</span>
          <h2 className="text-4xl md:text-5xl font-serif text-primary">Popular Right Now</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <ProductCard key={product._id || idx} product={product} />
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/shop" className="btn-outline inline-block">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
