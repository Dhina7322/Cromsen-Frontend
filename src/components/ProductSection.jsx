import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

const ProductSection = ({ title, label, filter = {}, bgColor = "bg-white", initialProducts }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const data = await getProducts(filter);
        setProducts(data.products || (Array.isArray(data) ? data : []));
      } catch (err) {
        console.error(`Error fetching products for ${title}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [JSON.stringify(filter), initialProducts]);

  if (loading || (!products.length && Object.keys(filter).length > 0)) return null;

  return (
    <section className={`section-padding ${bgColor}`}>
      <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 px-4">
          <span className="text-action lowercase font-serif italic text-lg mb-2 block">{label}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-primary">{title}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product, idx) => (
            <ProductCard key={product.slug || product._id || idx} product={product} />
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to={filter.category ? `/shop?category=${filter.category}` : "/shop"} className="btn-outline inline-block">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
