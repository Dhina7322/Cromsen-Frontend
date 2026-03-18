import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  ImageIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const API = "/api";

export default function CategoriesTab() {
  const { showToast } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});

  // Form States
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [subForm, setSubForm] = useState({ name: "", category: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  // Track the existing image filename so we can send it on update if no new file chosen
  const [existingImageFilename, setExistingImageFilename] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, scRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/subcategories`)
      ]);
      setCategories(cRes.data);
      setSubCategories(scRes.data);
    } catch (err) {
      showToast("error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingItem(cat);
      setCatForm({ name: cat.name, description: cat.description || "" });
      setImagePreview(cat.image ? `/uploads/${cat.image}` : "");
      setExistingImageFilename(cat.image || "");
    } else {
      setEditingItem(null);
      setCatForm({ name: "", description: "" });
      setImagePreview("");
      setExistingImageFilename("");
    }
    setImageFile(null);
    setIsCatModalOpen(true);
  };

  const handleOpenSubModal = (sub = null, catId = "") => {
    if (sub) {
      setEditingItem(sub);
      setSubForm({ name: sub.name, category: sub.category?._id || sub.category });
      setImagePreview(sub.image ? `/uploads/${sub.image}` : "");
      setExistingImageFilename(sub.image || "");
    } else {
      setEditingItem(null);
      setSubForm({ name: "", category: catId });
      setImagePreview("");
      setExistingImageFilename("");
    }
    setImageFile(null);
    setIsSubModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("name", catForm.name);
    data.append("description", catForm.description);

    if (imageFile) {
      // New image chosen — upload it
      data.append("image", imageFile);
    } else if (editingItem && existingImageFilename) {
      // No new image — tell the backend to keep the existing one
      data.append("existingImage", existingImageFilename);
    }

    try {
      if (editingItem) {
        await axios.put(`${API}/categories/${editingItem._id}`, data);
        showToast("success", "Category updated");
      } else {
        await axios.post(`${API}/categories`, data);
        showToast("success", "Category created");
      }
      setIsCatModalOpen(false);
      fetchData();
    } catch (err) {
      showToast("error", "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const submitSubCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("name", subForm.name);
    data.append("category", subForm.category);

    if (imageFile) {
      data.append("image", imageFile);
    } else if (editingItem && existingImageFilename) {
      data.append("existingImage", existingImageFilename);
    }

    try {
      if (editingItem) {
        await axios.put(`${API}/subcategories/${editingItem._id}`, data);
        showToast("success", "Sub-category updated");
      } else {
        await axios.post(`${API}/subcategories`, data);
        showToast("success", "Sub-category created");
      }
      setIsSubModalOpen(false);
      fetchData();
    } catch (err) {
      showToast("error", "Failed to save sub-category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure? This will delete the item permanently.")) return;
    try {
      await axios.delete(`${API}/${type}/${id}`);
      showToast("success", "Deleted successfully");
      fetchData();
    } catch (err) {
      showToast("error", "Failed to delete");
    }
  };

  return (
    <div className="section-gap">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="searchbox">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button className="btn-primary" onClick={() => handleOpenCatModal()}>
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredCategories.map(cat => (
          <div key={cat._id} className="card">
            <div
              className="panel-head"
              style={{ borderBottom: expandedCats[cat._id] ? '1px solid var(--border)' : 'none', flexWrap: 'nowrap' }}
            >
              <div
                className="cust-cell"
                onClick={() => toggleExpand(cat._id)}
                style={{ cursor: 'pointer', flex: '1 1 auto', minWidth: 0 }}
              >
                {cat.image ? (
                  <img src={`/uploads/${cat.image}`} alt="" className="prod-thumb" />
                ) : (
                  <div className="prod-thumb-ph"><Layers size={14} /></div>
                )}
                <div style={{ marginLeft: '8px' }}>
                  <div className="cust-name">{cat.name}</div>
                  <div className="cust-phone">
                    {subCategories.filter(s => (s.category?._id || s.category) === cat._id).length} Sub-categories
                  </div>
                </div>
                <div style={{ marginLeft: '12px', color: 'var(--text3)' }}>
                  {expandedCats[cat._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              <div className="panel-actions">
                <button className="topbar-btn" onClick={() => handleOpenSubModal(null, cat._id)}>
                  <Plus size={14} /> Add Sub
                </button>
                <button className="icon-btn" onClick={() => handleOpenCatModal(cat)}><Edit2 size={14} /></button>
                <button className="icon-btn danger" onClick={() => handleDelete('categories', cat._id)}><Trash2 size={14} /></button>
              </div>
            </div>

            <AnimatePresence>
              {expandedCats[cat._id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="tbl-wrap" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="tbl">
                      <tbody style={{ background: '#fcfcfc' }}>
                        {subCategories
                          .filter(s => (s.category?._id || s.category) === cat._id)
                          .map(sub => (
                            <tr key={sub._id}>
                              <td style={{ paddingLeft: '60px' }}>
                                <div className="prod-cell">
                                  {sub.image ? (
                                    <img
                                      src={`/uploads/${sub.image}`}
                                      alt=""
                                      className="prod-thumb"
                                      style={{ width: 30, height: 30 }}
                                    />
                                  ) : (
                                    <div className="prod-thumb-ph" style={{ width: 30, height: 30, fontSize: 10 }}>S</div>
                                  )}
                                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{sub.name}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="row-acts">
                                  <button className="icon-btn" onClick={() => handleOpenSubModal(sub)}><Edit2 size={12} /></button>
                                  <button className="icon-btn danger" onClick={() => handleDelete('subcategories', sub._id)}><Trash2 size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {subCategories.filter(s => (s.category?._id || s.category) === cat._id).length === 0 && (
                          <tr>
                            <td colSpan="2" className="empty-row" style={{ fontSize: '12px', padding: '20px' }}>
                              No sub-categories yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className="card p-10 text-center text-gray-400">No categories found</div>
        )}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isCatModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal modal--sm">
              <div className="modal-head">
                <h2>{editingItem ? 'Edit Category' : 'New Category'}</h2>
                <button className="icon-btn" onClick={() => setIsCatModalOpen(false)}><X size={18} /></button>
              </div>
              <form onSubmit={submitCategory}>
                <div className="modal-body">
                  <div className="fg">
                    <label>Category Name</label>
                    <input
                      required
                      type="text"
                      value={catForm.name}
                      onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                    />
                  </div>
                  <div className="fg">
                    <label>Description (Optional)</label>
                    <textarea
                      rows="2"
                      value={catForm.description}
                      onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                    />
                  </div>
                  <div className="fg">
                    <label>Category Image</label>
                    <div className="upload-wrap">
                      <label className="upload-box">
                        <input type="file" accept="image/*" className="hidden-input" onChange={handleImageChange} />
                        {imagePreview
                          ? <img src={imagePreview} className="upload-preview" alt="preview" />
                          : <ImageIcon size={20} />
                        }
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          className="icon-btn danger"
                          style={{ marginTop: 6 }}
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                            setExistingImageFilename("");
                          }}
                        >
                          <X size={12} /> Remove image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setIsCatModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sub-Category Modal */}
      <AnimatePresence>
        {isSubModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal modal--sm">
              <div className="modal-head">
                <h2>{editingItem ? 'Edit Sub-Category' : 'New Sub-Category'}</h2>
                <button className="icon-btn" onClick={() => setIsSubModalOpen(false)}><X size={18} /></button>
              </div>
              <form onSubmit={submitSubCategory}>
                <div className="modal-body">
                  <div className="fg">
                    <label>Parent Category</label>
                    <select
                      required
                      value={subForm.category}
                      onChange={e => setSubForm({ ...subForm, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="fg">
                    <label>Sub-Category Name</label>
                    <input
                      required
                      type="text"
                      value={subForm.name}
                      onChange={e => setSubForm({ ...subForm, name: e.target.value })}
                    />
                  </div>
                  <div className="fg">
                    <label>Sub-Category Image</label>
                    <div className="upload-wrap">
                      <label className="upload-box">
                        <input type="file" accept="image/*" className="hidden-input" onChange={handleImageChange} />
                        {imagePreview
                          ? <img src={imagePreview} className="upload-preview" alt="preview" />
                          : <ImageIcon size={20} />
                        }
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          className="icon-btn danger"
                          style={{ marginTop: 6 }}
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                            setExistingImageFilename("");
                          }}
                        >
                          <X size={12} /> Remove image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setIsSubModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Sub-Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}