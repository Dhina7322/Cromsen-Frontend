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
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningCat, setAssigningCat] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});

  // Form States
  const [catForm, setCatForm] = useState({ name: "", description: "" });
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
      const [cRes, pRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products?limit=1000`)
      ]);
      setCategories(cRes.data);
      setProducts(pRes.data.products || pRes.data);
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

  const handleOpenAssignModal = (cat) => {
    setAssigningCat(cat);
    // Find products already in this category
    const existingIds = products
      .filter(p => (p.category?._id || p.category) === cat._id)
      .map(p => p._id);
    setSelectedProductIds(existingIds);
    setIsAssignModalOpen(true);
  };

  const toggleProductSelection = (prodId) => {
    setSelectedProductIds(prev => 
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
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

  const submitAssignProducts = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API}/products/bulk-category`, {
        categoryId: assigningCat._id,
        productIds: selectedProductIds
      });
      showToast("success", "Products assigned successfully");
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      showToast("error", "Failed to assign products");
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
                    {products.filter(p => (p.category?._id || p.category) === cat._id).length} Products Assigned
                  </div>
                </div>
                <div style={{ marginLeft: '12px', color: 'var(--text3)' }}>
                  {expandedCats[cat._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              <div className="panel-actions">
                <button className="topbar-btn" onClick={() => handleOpenAssignModal(cat)}>
                  <Plus size={14} /> Assign Products
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
                        {products
                          .filter(p => (p.category?._id || p.category) === cat._id)
                          .map(prod => (
                            <tr key={prod._id}>
                              <td style={{ paddingLeft: '60px' }}>
                                <div className="prod-cell">
                                  {prod.image || (prod.images && prod.images[0]) ? (
                                    <img
                                      src={prod.image?.startsWith('http') ? prod.image : `/uploads/${prod.image || prod.images[0]}`}
                                      alt=""
                                      className="prod-thumb"
                                      style={{ width: 30, height: 30 }}
                                    />
                                  ) : (
                                    <div className="prod-thumb-ph" style={{ width: 30, height: 30, fontSize: 10 }}>P</div>
                                  )}
                                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{prod.name}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {products.filter(p => (p.category?._id || p.category) === cat._id).length === 0 && (
                          <tr>
                            <td colSpan="2" className="empty-row" style={{ fontSize: '12px', padding: '20px' }}>
                              No products assigned yet
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

      {/* Assign Products Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="modal modal--md">
              <div className="modal-head">
                <h2>Assign Products to {assigningCat?.name}</h2>
                <button className="icon-btn" onClick={() => setIsAssignModalOpen(false)}><X size={18} /></button>
              </div>
              <form onSubmit={submitAssignProducts}>
                <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px' }}>
                    Select the products you want to assign to this category. Unselecting a product will remove it from the category.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {products.map(p => (
                      <label key={p._id} className="flex items-center gap-3 p-2 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedProductIds.includes(p._id)}
                          onChange={() => toggleProductSelection(p._id)}
                          className="w-4 h-4 text-action bg-gray-100 border-gray-300 rounded focus:ring-action"
                        />
                        {p.image || (p.images && p.images[0]) ? (
                           <img src={p.image?.startsWith('http') ? p.image : `/uploads/${p.image || p.images[0]}`} className="w-8 h-8 rounded object-cover" />
                        ) : (
                           <div className="w-8 h-8 rounded bg-gray-200" />
                        )}
                        <span className="text-sm">{p.name} <span className="text-[10px] text-gray-400">({p.sku || 'No SKU'})</span></span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving Update...' : 'Save Assignments'}
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