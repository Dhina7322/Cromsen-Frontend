import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New state for advanced features
  const [productsPerRow, setProductsPerRow] = useState(3);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const activeCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catData = await getCategories();
        setCategories([{ _id: 'All', name: 'All' }, ...catData]);

        const res = await getProducts({
          ...(activeCategory !== 'All' && { category: activeCategory }),
          ...(searchQuery && { search: searchQuery }),
          page: currentPage,
          limit: productsPerPage,
          sort: sortBy
        });

        // Backend now returns { products, total, page, pages }
        setProducts(res.products || []);
        setTotalProducts(res.total || 0);
        setTotalPages(res.pages || 1);
      } catch (err) {
        console.error('Error fetching shop data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeCategory, searchQuery, currentPage, productsPerPage, sortBy]);

  const generateSlug = (name) => {
    if (name === 'All') return 'All';
    return name.toLowerCase().replace(/[\s_]+/g, '-');
  };

  const isCatActive = (cat) => {
    const slug = generateSlug(cat.name);
    return activeCategory === slug;
  };

  const handleCategoryChange = (catName) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (catName === 'All') {
        newParams.delete('category');
      } else {
        newParams.set('category', generateSlug(catName));
      }
      return newParams;
    });
    setIsSidebarOpen(false);
    setCurrentPage(1);
  };

  // Grid classes mapper
  const gridClasses = {
    3: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  };

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-12 border-b border-gray-100 pb-8 gap-4">
          <div>
            <h1 className="text-4xl font-serif mb-2 text-primary font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop All'}
            </h1>
            <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">{totalProducts} products found</p>
          </div>
          
          <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-bold text-gray-500">
            {/* Products Per Row */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline">Products Per Row</span>
              <div className="relative">
                <select 
                  className="appearance-none bg-transparent border-none focus:outline-none pr-6 cursor-pointer text-primary"
                  value={productsPerRow}
                  onChange={(e) => setProductsPerRow(Number(e.target.value))}
                >
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-primary" />
              </div>
            </div>

            <div className="w-[1px] h-4 bg-gray-300"></div>

            {/* Products Per Page */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline">Show</span>
              <div className="relative">
                <select 
                  className="appearance-none bg-transparent border-none focus:outline-none pr-6 cursor-pointer text-primary"
                  value={productsPerPage}
                  onChange={(e) => {
                    setProductsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-primary" />
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden ml-auto flex items-center space-x-2 border border-gray-200 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <Filter size={14} />
              <span>{isSidebarOpen ? 'Close Filters' : 'Filter'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block md:w-64 shrink-0`}>
            <div className="p-6 md:p-6 bg-gray-50 rounded h-full border border-gray-100">

              <div className="mb-12">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-6 border-b border-gray-200 pb-4 text-primary">Categories</h3>
                <ul className="space-y-1">
                  {categories.map((cat) => (
                    <li key={cat._id || cat.name}>
                      <button 
                        onClick={() => handleCategoryChange(cat.name)}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-all font-sans flex items-center space-x-3 ${isCatActive(cat) ? 'bg-action text-white font-bold shadow-sm' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}
                      >
                        {cat.image && (
                          <div className={`w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-white ${isCatActive(cat) ? 'opacity-90' : 'opacity-70 group-hover:opacity-100'}`}>
                            <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span>{cat.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-6 border-b border-gray-200 pb-4 text-primary">Sort By</h3>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-3 text-sm focus:outline-none focus:border-action text-gray-600 font-sans shadow-sm cursor-pointer"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-grow flex flex-col">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-action"></div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-4 sm:gap-6 ${gridClasses[productsPerRow]}`}>
                  {products.map((product) => (
                    <ProductCard key={product.slug || product._id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-16 pt-8 border-t border-gray-100">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-sm font-sans mx-4 text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-gray-50 rounded border border-gray-100">
                <p className="text-gray-500 font-sans flex flex-col items-center">
                  <span className="text-4xl mb-4 opacity-50">🔍</span>
                  No products found in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
