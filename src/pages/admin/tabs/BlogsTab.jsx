import React, { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Plus, Search, Edit2, Trash2, Eye, X, 
  Image as ImageIcon, Loader2, MoreVertical,
  CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { getAdminBlogs, createBlog, updateBlog, deleteBlog } from '../../../services/api';
import { getImageUrl } from '../../../utils/imageUtils';

const BlogsTab = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [viewBlog, setViewBlog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    shortDescription: '',
    isActive: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'],
      ['code-block']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 
    'color', 'background', 'list', 'bullet', 'align', 
    'link', 'image', 'video', 'clean', 'code-block'
  ];

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await getAdminBlogs();
      setBlogs(data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setCurrentBlog(blog);
      setFormData({
        title: blog.title,
        content: blog.content,
        shortDescription: blog.shortDescription || '',
        isActive: blog.isActive,
        image: null
      });
      setImagePreview(getImageUrl(blog.image));
    } else {
      setCurrentBlog(null);
      setFormData({
        title: '',
        content: '',
        shortDescription: '',
        isActive: true,
        image: null
      });
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('shortDescription', formData.shortDescription);
      data.append('isActive', formData.isActive);
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (currentBlog) {
        await updateBlog(currentBlog._id, data);
      } else {
        await createBlog(data);
      }
      
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(id);
        fetchBlogs();
      } catch (err) {
        alert('Error deleting blog');
      }
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#fafafa] min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-serif text-primary mb-2 flex items-center gap-3">
            <FileText className="text-action" size={32} />
            Blogs Management
          </h1>
          <p className="text-gray-400 text-sm font-light">Share stories, news, and design inspiration with your audience.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/10 flex items-center gap-3 active:scale-95"
        >
          <Plus size={18} /> New Blog Post
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-[24px] border border-gray-100 flex items-center gap-5 hover:shadow-md hover:shadow-blue-500/5 transition-all">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText size={18} />
              </div>
              <div>
                  <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest block mb-0.5">Total Stories</span>
                  <span className="text-xl font-serif text-primary leading-none">{blogs.length}</span>
              </div>
          </div>
          <div className="bg-white p-5 rounded-[24px] border border-gray-100 flex items-center gap-5 hover:shadow-md hover:shadow-green-500/5 transition-all">
              <div className="w-11 h-11 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
              </div>
              <div>
                  <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest block mb-0.5">Published</span>
                  <span className="text-xl font-serif text-primary leading-none">{blogs.filter(b => b.isActive).length}</span>
              </div>
          </div>
          <div className="bg-white p-5 rounded-[24px] border border-gray-100 flex items-center gap-5 hover:shadow-md hover:shadow-amber-500/5 transition-all">
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertCircle size={18} />
              </div>
              <div>
                  <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest block mb-0.5">Drafts</span>
                  <span className="text-xl font-serif text-primary leading-none">{blogs.filter(b => !b.isActive).length}</span>
              </div>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden backdrop-blur-sm">
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all font-light"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Post</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Date Created</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-action" size={32} />
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-gray-400 italic font-light">
                    No blogs found. Start by creating your first post!
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-[14px] overflow-hidden bg-gray-100 ring-2 ring-transparent group-hover:ring-blue-100/50 transition-all shadow-sm">
                          <img src={getImageUrl(blog.image)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-primary font-serif mb-0.5 line-clamp-1 text-sm">{blog.title}</p>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black opacity-60">/blog/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        blog.isActive ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {blog.isActive ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-light">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setViewBlog(blog); setIsViewModalOpen(true); }}
                          className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="View Live"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(blog)}
                          className="p-3 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog._id)}
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <FileText size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-serif text-primary leading-tight">
                    {currentBlog ? 'Edit Story' : 'Craft New Story'}
                    </h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-0.5 opacity-60">Creative Studio</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 border border-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#fcfcfc]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Post Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter a compelling title..."
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-xl text-lg font-serif outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Main Content</label>
                    <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-inner">
                      <ReactQuill 
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        modules={modules}
                        formats={formats}
                        placeholder="Once upon a time in Design Studio..."
                        className="bg-white min-h-[400px] text-lg font-sans"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Pro-tip: You can paste images and videos directly into the editor.</p>
                  </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Featured Image</label>
                    <div className="relative group">
                      <div className={`aspect-[4/3] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden ${
                        imagePreview ? 'border-solid border-blue-100 bg-blue-50/20' : 'border-gray-200 bg-gray-50 hover:border-action/30 hover:bg-gray-100 flex items-center justify-center'
                      }`}>
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <label className="cursor-pointer bg-white text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-action hover:text-white transition-all">
                                    Change Image
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-4 w-full h-full justify-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-action transition-all">
                                <ImageIcon size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Pick Cover</p>
                                <p className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP (16:9 recommended)</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">SEO Description</label>
                    <textarea 
                      rows="4"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Short summary for SEO and listing..."
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all font-light resize-none"
                    />
                    <p className="text-[10px] text-gray-400">Leave empty to auto-generate from content.</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary block">Visibility</span>
                        <span className="text-[10px] text-gray-400">Published to website</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`relative w-14 h-8 rounded-full transition-all duration-500 ${formData.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500 ${formData.isActive ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-gray-50 flex justify-end gap-4 sticky bottom-0 bg-white/80 backdrop-blur-md z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/10 flex items-center gap-3 disabled:opacity-50 disabled:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : null}
                  {currentBlog ? 'Update Post' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewBlog && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-action">Draft Preview</span>
                    <h2 className="text-2xl font-serif text-primary mt-1">{viewBlog.title}</h2>
                  </div>
                  <button onClick={() => setIsViewModalOpen(false)} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 transition-all">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <img src={getImageUrl(viewBlog.image)} alt="" className="w-full aspect-[16/9] object-cover rounded-3xl mb-12 shadow-xl" />
                    <div className="max-w-3xl mx-auto prose prose-blue prose-lg" dangerouslySetInnerHTML={{ __html: viewBlog.content }} />
                </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default BlogsTab;
