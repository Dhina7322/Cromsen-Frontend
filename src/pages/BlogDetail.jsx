import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { getBlogBySlug } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await getBlogBySlug(slug);
        setBlog(data);
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    window.scrollTo(0, 0); // Reset scroll to top
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-action border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen pt-40 text-center">
        <h1 className="text-4xl font-serif text-primary mb-6">Blog Post Not Found</h1>
        <Link to="/blogs" className="text-action hover:underline">Back to all blogs</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Blog Article Header */}
      <section className="pt-24 px-5 max-w-4xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              to="/blogs" 
              className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-action transition-all"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Back into Blogs
            </Link>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 text-[10px] text-action font-black uppercase tracking-[0.4em]">
               <span className="flex items-center gap-1.5"><Calendar size={12} strokeWidth={3} /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif text-primary leading-[1.1] tracking-tight">
              {blog.title}
            </h1>
            
            <p className="text-xl text-gray-500 font-light leading-relaxed max-w-3xl">
              {blog.shortDescription}
            </p>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden shadow-xl shadow-black/5 mb-12 group">
             <img 
               src={getImageUrl(blog.image)} 
               alt={blog.title} 
               className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
             />
             <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl" />
          </div>

            {/* Content Section */}
            <div 
              className="prose prose-md max-w-none text-gray-700 leading-[1.8] font-sans prose-img:rounded-xl prose-img:shadow-lg prose-headings:font-serif prose-headings:text-primary prose-a:text-action"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
        </motion.div>
      </section>

      {/* No related stories as per user request */}
    </div>
  );
};

export default BlogDetail;
