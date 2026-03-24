import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || "/api";

const PolicyPage = () => {
  const { type } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/policies/${type}`);
        setPolicy(res.data);
      } catch (err) {
        console.error("Policy load failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [type]);

  if (loading) return <div className="pt-64 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Policy...</div>;

  if (!policy) return (
     <div className="pt-64 text-center">
       <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Not Found</h2>
       <Link to="/" className="text-action text-[10px] uppercase font-black tracking-widest">Back to Home</Link>
     </div>
  );

  return (
    <div className="pt-40 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-[900px] px-5">
        <div className="bg-white p-10 md:p-16 shadow-xl rounded-2xl border border-gray-100 overflow-hidden relative">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-[2px] w-8 bg-action"></span>
            <span className="text-action uppercase tracking-[0.3em] text-[10px] font-black">Legal Info</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-10 leading-tight">{policy.title}</h1>
          
          <div className="prose prose-neutral max-w-none">
            <div 
              className="text-gray-600 leading-relaxed space-y-6"
              style={{ whiteSpace: 'pre-line' }}
              dangerouslySetInnerHTML={{ __html: policy.content.replace(/\n/g, '<br/>') }}
            />
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
             <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                Back to Store
             </Link>
             <span className="text-[10px] text-gray-300 uppercase font-bold tracking-widest">
               Last Updated: {new Date(policy.updatedAt || policy.createdAt).toLocaleDateString()}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
