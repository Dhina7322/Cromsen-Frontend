import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { getBlogs } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const BlogsListing = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogs();
        setBlogs(data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-action border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop" 
            alt="Cromsen Blogs" 
            className="w-full h-full object-cover brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-white/80 uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">Inspiration & Insights</span>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight">Our Blogs</h1>
            <div className="flex items-center justify-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-widest">
               <Link to="/" className="hover:text-white transition-colors">Home</Link>
               <span className="w-1.5 h-1.5 rounded-full bg-action" />
               <span className="text-white">Blogs</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <div className="container mx-auto px-5 py-24">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif text-gray-400">No blogs posted yet. Stay tuned!</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {blogs.map((blog, idx) => (
              <motion.article
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 border border-transparent hover:border-gray-100"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={getImageUrl(blog.image)} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
                      Interior
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-8 flex flex-col">
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-action" /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <h3 className="text-2xl font-serif text-primary mb-4 leading-tight group-hover:text-action transition-colors">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-3 mb-8 flex-1">
                    {blog.shortDescription}
                  </p>

                  <Link 
                    to={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-2 group/btn text-primary text-[10px] font-black uppercase tracking-[0.3em] hover:text-action transition-all"
                  >
                    Read Story <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter / Call to Action */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-action/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-5 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Stay Inspired with Our Weekly Newsletter</h2>
            <p className="text-white/60 text-sm max-w-xl mx-auto mb-10 leading-relaxed font-light">
              Join our community of interior design enthusiasts and get the latest trends, tips, and exclusive offers delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white/10 border border-white/20 px-6 py-4 rounded-xl text-white text-sm outline-none focus:bg-white/15 focus:border-white/40 transition-all flex-1"
                />
                <button className="bg-action text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl active:scale-95">
                  Subscribe
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default BlogsListing;
