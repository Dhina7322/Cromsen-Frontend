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
      <section className="pt-40 px-5 max-w-4xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between mb-12">
            <Link 
              to="/blogs" 
              className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-action transition-all"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to library
            </Link>
          </div>

          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-4 text-[10px] text-action font-black uppercase tracking-[0.4em]">
               <span className="flex items-center gap-1.5"><Calendar size={12} strokeWidth={3} /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
               <span className="w-1 h-1 rounded-full bg-gray-200" />
               <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={3} /> 5 min read</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif text-primary leading-[1.1] tracking-tight">
              {blog.title}
            </h1>
            
            <p className="text-xl text-gray-500 font-light leading-relaxed max-w-3xl">
              {blog.shortDescription}
            </p>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/10 mb-20 group">
             <img 
               src={getImageUrl(blog.image)} 
               alt={blog.title} 
               className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
             />
             <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
          </div>

          {/* Social Share Sidebar (Desktop Only) */}
          <div className="relative">
            <div className="hidden lg:block absolute -left-24 top-0 space-y-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 rotate-90 block mb-12 origin-left translate-y-8">Share Story</span>
               <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <Facebook size={18} />
               </button>
               <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <Twitter size={18} />
               </button>
               <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <Linkedin size={18} />
               </button>
            </div>

            {/* Content Section */}
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-[1.8] font-sans prose-img:rounded-2xl prose-img:shadow-xl prose-headings:font-serif prose-headings:text-primary prose-a:text-action"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Footer Socials (Mobile) */}
          <div className="lg:hidden flex items-center gap-4 py-12 border-t border-gray-100 mt-20">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">Share this story:</span>
             <Facebook size={20} className="text-gray-400 hover:text-action transition-colors cursor-pointer" />
             <Twitter size={20} className="text-gray-400 hover:text-action transition-colors cursor-pointer" />
             <Linkedin size={20} className="text-gray-400 hover:text-action transition-colors cursor-pointer" />
          </div>

          {/* Author Card */}
          <div className="mt-20 p-8 md:p-12 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-8">
             <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white shadow-sm ring-4 ring-white">
                <img 
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop" 
                  alt="Author" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                />
             </div>
             <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-action mb-2 block">Written by</span>
                <h4 className="text-2xl font-serif text-primary mb-3">Our Design Studio</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed font-light">
                  A passionate collective of designers and craftsmen dedicated to creating spaces that tell a story. We believe every window deserves a premium frame and every corner a touch of elegance.
                </p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Recommended Section (Static placeholder or logic later) */}
      <section className="bg-white pt-32 mt-32 border-t border-gray-100 overflow-hidden">
         <div className="container mx-auto px-5">
            <div className="text-center mb-16">
               <span className="text-action lowercase font-serif italic text-lg mb-4 block">keep reading</span>
               <h2 className="text-4xl font-serif text-primary">Related Stories</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
               {/* Placeholders for related blogs */}
               {[1, 2, 3].map(i => (
                 <div key={i} className="space-y-4">
                    <div className="aspect-[16/10] bg-gray-100 rounded-2xl" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                    <div className="h-6 bg-gray-100 rounded w-3/4" />
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default BlogDetail;
