import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Plus, Search, Edit2, Trash2, Eye, X, 
  Image as ImageIcon, Loader2,
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
      setFormData({ title: '', content: '', shortDescription: '', isActive: true, image: null });
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
      if (formData.image) data.append('image', formData.image);

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
    <div className="p-6 space-y-6 bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-serif text-primary flex items-center gap-2">
            <FileText className="text-action" size={26} />
            Blogs Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Share stories, news, and design inspiration.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Blog Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest block">Total Stories</span>
            <span className="text-xl font-serif text-primary">{blogs.length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest block">Published</span>
            <span className="text-xl font-serif text-primary">{blogs.filter(b => b.isActive).length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest block">Drafts</span>
            <span className="text-xl font-serif text-primary">{blogs.filter(b => !b.isActive).length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Post</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-5 py-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-action" size={28} />
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-16 text-center text-gray-400 italic text-sm">
                    No blogs found. Start by creating your first post!
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <img src={getImageUrl(blog.image)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-primary font-medium text-sm line-clamp-1">{blog.title}</p>
                          <p className="text-[10px] text-gray-400">/blog/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        blog.isActive ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {blog.isActive ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {/* Actions always visible */}
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setViewBlog(blog); setIsViewModalOpen(true); }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(blog)}
                          className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

      {/* Create/Edit Modal — rendered via portal to escape layout stacking context */}
      {isModalOpen && ReactDOM.createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-serif text-primary leading-tight">
                    {currentBlog ? 'Edit Story' : 'Craft New Story'}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left — Main Info */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Post Title</label>
                      <input 
                        type="text" 
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter a compelling title..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-serif outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Main Content</label>
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <ReactQuill 
                          value={formData.content}
                          onChange={(content) => setFormData({ ...formData, content })}
                          modules={modules}
                          formats={formats}
                          placeholder="Once upon a time in Design Studio..."
                          className="bg-white"
                          style={{ minHeight: '220px' }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 italic">Pro-tip: You can paste images and videos directly into the editor.</p>
                    </div>
                  </div>

                  {/* Right — Sidebar */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Featured Image</label>
                      <div className="relative group">
                        <div className={`aspect-[4/3] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${
                          imagePreview ? 'border-solid border-blue-100' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}>
                          {imagePreview ? (
                            <>
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-white text-primary px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all">
                                  Change
                                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                              </div>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-3 w-full h-full justify-center">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                                <ImageIcon size={24} />
                              </div>
                              <div className="text-center">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Pick Cover</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP</p>
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">SEO Description</label>
                      <textarea 
                        rows="3"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        placeholder="Short summary for SEO..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                      />
                      <p className="text-[10px] text-gray-400">Leave empty to auto-generate.</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">Visibility</span>
                        <span className="text-[10px] text-gray-400">Published to website</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${formData.isActive ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-primary border border-gray-200 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={13} /> : null}
                  {currentBlog ? 'Update Post' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Modal */}
      {isViewModalOpen && viewBlog && ReactDOM.createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '88vh' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-primary mt-0.5">{viewBlog.title}</h2>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <img src={getImageUrl(viewBlog.image)} alt="" className="w-full aspect-[16/9] object-cover rounded-2xl mb-8 shadow-md" />
              <div className="max-w-2xl mx-auto prose prose-blue" dangerouslySetInnerHTML={{ __html: viewBlog.content }} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default BlogsTab;