import React, { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  X,
  Save,
  ImageIcon,
  Download,
  Upload,
  FileText,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import { useOutletContext } from "react-router-dom";

const API = "/api";

export default function InventoryTab() {
  const { showToast } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSupportData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [cRes, scRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/subcategories`)
      ]);
      setCategories(cRes.data);
      setSubCategories(scRes.data);
    } catch (err) {
      console.error("Support data error:", err);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    retailPrice: "",
    wholesalePrice: "",
    category: "",
    subCategory: "",
    stock: "",
    isActive: true,
    featured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku || "",
        description: product.description,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        category: product.category?._id || product.category,
        subCategory: product.subCategory?._id || product.subCategory || "",
        stock: product.stock,
        isActive: product.isActive ?? true,
        featured: product.featured || false
      });
      setImagePreview(product.image ? `/uploads/${product.image}` : "");
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        sku: "",
        description: "",
        retailPrice: "",
        wholesalePrice: "",
        category: "",
        subCategory: "",
        stock: "",
        isActive: true,
        featured: false
      });
      setImagePreview("");
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct._id}`, data);
        showToast("success", "Product updated successfully");
      } else {
        await axios.post(`${API}/products`, data);
        showToast("success", "Product created successfully");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      showToast("success", "Product deleted");
      fetchProducts();
    } catch (err) {
      showToast("error", "Failed to delete product");
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API}/products/export`);
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'cromsen_products.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showToast("success", "Products exported successfully");
    } catch (err) {
      showToast("error", "Failed to export products");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const productsArray = JSON.parse(event.target.result);
        const res = await axios.post(`${API}/products/import`, { products: productsArray });
        showToast("success", res.data.message);
        fetchProducts();
      } catch (err) {
        showToast("error", "Invalid file format or import failed");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  return (
    <div className="section-gap">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="searchbox">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="topbar-btn" onClick={handleExport} title="Download JSON">
            <Download size={14} /> Export
          </button>
          <label className="topbar-btn cursor-pointer" title="Upload JSON">
            <Upload size={14} /> Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button className="topbar-btn" onClick={fetchProducts} title="Refresh Products">
            <RefreshCw size={14} />
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Retail Price</th>
              <th>Wholesale</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p._id}>
                <td>
                  <div className="prod-cell">
                    {p.image ? (
                      <img src={`/uploads/${p.image}`} alt="" className="prod-thumb" />
                    ) : (
                      <div className="prod-thumb-ph">{p.name[0]}</div>
                    )}
                    <span className="prod-name">{p.name}</span>
                  </div>
                </td>
                <td><span className="sku-tag">{p.sku || 'N/A'}</span></td>
                <td><span className="cat-tag">{p.category?.name || 'Uncategorized'}</span></td>
                <td className="price-user">₹{p.retailPrice}</td>
                <td className="price-dealer">₹{p.wholesalePrice}</td>
                <td>
                  <span className={`stock-badge ${p.stock === 0 ? 'stock-oos' : p.stock < 10 ? 'stock-low' : 'stock-ok'}`}>
                    {p.stock}
                  </span>
                </td>
                <td>
                   <span className={`status-tag ${p.isActive ? 's-delivered' : 's-cancelled'}`}>
                     <i></i> {p.isActive ? 'Active' : 'Inactive'}
                   </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="row-acts">
                    <button className="icon-btn" onClick={() => handleOpenModal(p)}><Edit2 size={14}/></button>
                    <button className="icon-btn danger" onClick={() => handleDelete(p._id)}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && <tr><td colSpan="8" className="empty-row">No products found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal"
            >
              <div className="modal-head">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={18}/></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-r2">
                    <div className="fg">
                      <label>Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="fg">
                      <label>SKU (Internal Code)</label>
                      <input 
                        type="text" 
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="fg">
                    <label>Description</label>
                    <textarea 
                      required
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="form-r2">
                    <div className="price-field-group">
                      <label className="price-field-label--user">Retail Price</label>
                      <div className="price-input-wrap">
                        <span className="price-currency">₹</span>
                        <input 
                          required
                          type="number" 
                          value={formData.retailPrice}
                          onChange={(e) => setFormData({...formData, retailPrice: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="price-field-group price-field-group--dealer">
                      <label className="price-field-label--dealer">Wholesale Price</label>
                      <div className="price-input-wrap">
                        <span className="price-currency">₹</span>
                        <input 
                          required
                          type="number" 
                          value={formData.wholesalePrice}
                          onChange={(e) => setFormData({...formData, wholesalePrice: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-r3">
                    <div className="fg">
                      <label>Category</label>
                      <select 
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="fg">
                      <label>Sub Category</label>
                      <select 
                        value={formData.subCategory}
                        onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                      >
                        <option value="">None</option>
                        {subCategories.filter(sc => sc.category?._id === formData.category || sc.category === formData.category).map(sc => (
                          <option key={sc._id} value={sc._id}>{sc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="fg">
                      <label>Stock Count</label>
                      <input 
                        required
                        type="number" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="fg">
                    <label>Product Image</label>
                    <div className="upload-wrap">
                      <label className="upload-box">
                        <input type="file" className="hidden-input" onChange={handleImageChange} />
                        {imagePreview ? (
                          <img src={imagePreview} className="upload-preview" alt="Preview" />
                        ) : (
                          <>
                            <ImageIcon size={20} />
                            <span>Click to upload</span>
                          </>
                        )}
                      </label>
                      {imagePreview && (
                        <button type="button" className="remove-img" onClick={() => {setImagePreview(""); setImageFile(null);}}>
                          <X size={10}/>
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      Active for Sale
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      />
                      Featured Product
                    </label>
                  </div>
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    <Save size={16} /> {loading ? 'Saving...' : 'Save Product'}
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
