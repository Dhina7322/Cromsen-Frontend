import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X,
  Save,
  ImageIcon,
  Download,
  Upload,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const API = "/api";
const adminHeaders = { headers: { 'x-user-role': 'admin' } };

const getImageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  return `http://localhost:5001/uploads/${filename}`;
};

// ── CSV Helpers ───────────────────────────────────────────────────────────────
const CSV_PROD_HEADERS = ["sku", "name", "retailPrice", "wholesalePrice", "description", "category", "stock"];

const parseCSV = (text) => {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
  const rows = lines.slice(1).map(line => {
    const cols = []; let inQ = false, cur = "";
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    const obj = {}; headers.forEach((h, i) => { obj[h] = cols[i] !== undefined ? cols[i] : ""; });
    return obj;
  });
  return { headers, rows };
};

const downloadCSV = (filename, rows, headers) => {
  const escape = v => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map(row => headers.map(h => escape(row[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const generateSKU = (name, cat) => {
  const n = (name || "PRD").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4).padEnd(4, "X");
  const c = (cat || "GEN").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3).padEnd(3, "X");
  return `${c}-${n}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// ── Bulk Import Modal ─────────────────────────────────────────────────────────
const BulkImportModal = ({ onClose, categories, onImportDone, showToast }) => {
  const [step, setStep] = useState("upload");
  const [csvRows, setCsvRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });
  const [failedRows, setFailedRows] = useState([]);
  const fileRef = useRef(null);

  const catNameToId = (name) => {
    if (!name) return null;
    return categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase())?._id || null;
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers, rows } = parseCSV(e.target.result);
      const errs = [];
      if (!headers.includes("name")) errs.push('Missing required column: "name"');
      if (errs.length) { setErrors(errs); return; }
      const rowErrs = [];
      rows.forEach((row, i) => { if (!row.name?.trim()) rowErrs.push(`Row ${i + 2}: "name" is empty`); });
      setCsvRows(rows); setErrors(rowErrs);
      if (rows.length > 0) setStep("preview");
    };
    reader.readAsText(file);
  };

  const startImport = async () => {
    setStep("importing"); setProgress({ done: 0, total: csvRows.length, failed: 0 });
    const failed = []; let done = 0, failedCount = 0;

    for (const row of csvRows) {
      const catId = catNameToId(row.category);
      try {
        const fd = new FormData();
        const catName = categories.find(c => c._id === catId)?.name || "";
        fd.append("sku", (row.sku || "").trim() || generateSKU(row.name, catName));
        fd.append("name", row.name?.trim() || "");
        fd.append("retailPrice", Number(row.retailprice || row.retailPrice) || 0);
        fd.append("wholesalePrice", Number(row.wholesaleprice || row.wholesalePrice) || 0);
        fd.append("description", row.description?.trim() || "");
        if (catId) fd.append("category", catId);
        fd.append("stock", Number(row.stock) || 0);
        await axios.post(`${API}/products`, fd, { headers: { 'x-user-role': 'admin' } });
        done++;
      } catch (err) {
        failedCount++;
        failed.push({ ...row, _error: err?.response?.data?.message || "Failed" });
      }
      setProgress({ done: done + failedCount, total: csvRows.length, failed: failedCount });
    }
    setFailedRows(failed); setStep("done");
    if (done > 0) { onImportDone(); showToast("success", `${done} product${done !== 1 ? "s" : ""} imported!`); }
    if (failedCount > 0) showToast("error", `${failedCount} row${failedCount !== 1 ? "s" : ""} failed`);
  };

  const downloadTemplate = () => {
    const exCat = categories[0]?.name || "Electronics";
    downloadCSV("products_template.csv", [{
      sku: "ELC-SAMP-1234", name: "Sample Product", retailPrice: "999",
      wholesalePrice: "799", description: "Description here",
      category: exCat, stock: "50"
    }], CSV_PROD_HEADERS);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680, width: "95%" }}>
        <div className="modal-head">
          <h2>Bulk Import Products</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ padding: "20px 24px" }}>

          {step === "upload" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <button className="btn-primary" style={{ marginBottom: 8 }} onClick={downloadTemplate}>
                  <Download size={14} /> Download CSV Template
                </button>
                <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>
                  Columns: <code style={{ background: "var(--card2)", padding: "1px 5px", borderRadius: 4 }}>
                    sku, name, retailPrice, wholesalePrice, description, category, stock
                  </code>
                </p>
              </div>
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.name.endsWith(".csv")) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: "40px 24px", textAlign: "center", cursor: "pointer", background: "var(--card2)", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary, #3b82f6)"; e.currentTarget.style.background = "#eff6ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--card2)"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop your CSV file here</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>or click to browse — .csv files only</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
              {errors.length > 0 && (
                <div style={{ marginTop: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 14px" }}>
                  {errors.map((e, i) => <div key={i} style={{ fontSize: 12, color: "#dc2626" }}>• {e}</div>)}
                </div>
              )}
              {categories.length > 0 && (
                <div style={{ marginTop: 14, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#3b82f6", letterSpacing: ".5px", marginBottom: 8 }}>ⓘ Available Categories</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {categories.map(c => (
                      <span key={c._id} style={{ background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 10, padding: "2px 8px", fontSize: 11 }}>{c.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "preview" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 700 }}>{csvRows.length} products ready to import</span>
                <button className="btn-cancel" onClick={() => { setStep("upload"); setCsvRows([]); setErrors([]); }}>← Re-upload</button>
              </div>
              {errors.length > 0 && (
                <div style={{ marginBottom: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }}>
                  {errors.slice(0, 5).map((e, i) => <div key={i} style={{ fontSize: 11, color: "#92400e" }}>• {e}</div>)}
                </div>
              )}
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", maxHeight: 280, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "var(--card2)", position: "sticky", top: 0 }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "var(--text3)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>#</th>
                      {CSV_PROD_HEADERS.map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "var(--text3)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 50).map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "7px 10px", color: "var(--text3)" }}>{i + 1}</td>
                        {CSV_PROD_HEADERS.map(h => (
                          <td key={h} style={{ padding: "7px 10px", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row[h] || <span style={{ color: "var(--text3)" }}>—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-foot" style={{ marginTop: 16 }}>
                <button className="btn-cancel" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={startImport}>
                  <Upload size={14} /> Import {csvRows.length} Product{csvRows.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Importing products…</div>
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>{progress.done} / {progress.total} processed</div>
              <div style={{ background: "var(--card2)", borderRadius: 8, height: 10, overflow: "hidden", margin: "0 auto", maxWidth: 400, border: "1px solid var(--border)" }}>
                <div style={{ height: "100%", background: "#3b82f6", borderRadius: 8, width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`, transition: "width .3s ease" }} />
              </div>
              {progress.failed > 0 && <div style={{ marginTop: 12, fontSize: 12, color: "#dc2626" }}>{progress.failed} failed so far</div>}
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{progress.failed === 0 ? "✅" : "⚠️"}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Import Complete</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#16a34a" }}>{progress.done - progress.failed}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Imported</div>
                </div>
                {progress.failed > 0 && (
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#dc2626" }}>{progress.failed}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>Failed</div>
                  </div>
                )}
              </div>
              <div className="modal-foot" style={{ justifyContent: "center", gap: 10 }}>
                {failedRows.length > 0 && (
                  <button className="btn-cancel" onClick={() => downloadCSV("failed_imports.csv", failedRows, [...CSV_PROD_HEADERS, "_error"])}>
                    <Download size={14} /> Download Failed
                  </button>
                )}
                <button className="btn-primary" onClick={onClose}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Export Modal ──────────────────────────────────────────────────────────────
const ExportModal = ({ onClose, filteredProducts, showToast }) => {
  const [scope, setScope] = useState("all");
  const scopeOptions = [
    { value: "all", label: "All products", count: filteredProducts.length },
  ];

  const handleExport = () => {
    let rows = filteredProducts;
    downloadCSV(
      `products_export_${new Date().toISOString().slice(0, 10)}.csv`,
      rows.map(p => ({
        sku: p.sku || "",
        name: p.name || "",
        retailPrice: p.retailPrice || 0,
        wholesalePrice: p.wholesalePrice || 0,
        description: p.description || "",
        category: p.category?.name || "",
        stock: p.stock ?? 0
      })),
      CSV_PROD_HEADERS
    );
    showToast("success", `Exported ${rows.length} product${rows.length !== 1 ? "s" : ""}!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-head">
          <h2>Export Products</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 14 }}>
            Export products to CSV — can be re-imported to update product info.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text3)", letterSpacing: ".5px", marginBottom: 10 }}>Export scope</div>
            {scopeOptions.map(opt => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1.5px solid ${scope === opt.value ? "#3b82f6" : "var(--border)"}`, borderRadius: 8, background: scope === opt.value ? "#eff6ff" : "var(--card2)", cursor: "pointer", transition: "all .15s", marginBottom: 8 }}>
                <input type="radio" name="scope" value={opt.value} checked={scope === opt.value} onChange={() => setScope(opt.value)} style={{ accentColor: "#3b82f6" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{opt.count} product{opt.count !== 1 ? "s" : ""}</div>
                </div>
                {scope === opt.value && (
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={10} color="#fff" />
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleExport}>
            <Download size={14} /> Export Products
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main InventoryTab ─────────────────────────────────────────────────────────
export default function InventoryTab() {
  const { showToast } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", sku: "", description: "", retailPrice: "", wholesalePrice: "",
    category: "", stock: "", isActive: true, featured: false,
    variants: [], variantItems: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchSupportData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`, adminHeaders);
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [cRes] = await Promise.all([
        axios.get(`${API}/categories`, adminHeaders)
      ]);
      setCategories(cRes.data);
    } catch (err) {
      console.error("Support data error:", err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategories.length === 0) return matchesSearch;
    
    const pCats = Array.isArray(p.category) ? p.category.map(c => c._id || c) : [p.category?._id || p.category];
    const matchesCategory = selectedCategories.some(catId => pCats.includes(catId));
    
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, sku: product.sku || "",
        description: product.description, retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        category: Array.isArray(product.category) ? product.category.map(c => c._id || c) : (product.category?._id || product.category || []),
        stock: product.stock, isActive: product.isActive ?? true,
        featured: product.featured || false,
        variants: product.variants || [],
        variantItems: product.variantItems || []
      });
      setImagePreview(product.image ? getImageUrl(product.image) : "");
      setImagesPreviews(product.images ? product.images.map(img => getImageUrl(img)) : []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "", sku: "", description: "", retailPrice: "", wholesalePrice: "",
        category: [], stock: "", isActive: true, featured: false,
        variants: [], variantItems: []
      });
      setImagePreview("");
      setImagesPreviews([]);
    }
    setImageFile(null);
    setImagesFiles([]);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setImagesFiles(files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagesPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'variants' || key === 'variantItems' || key === 'category') {
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });
    if (imageFile) data.append("image", imageFile);
    if (imagesFiles.length) {
      imagesFiles.forEach(file => data.append("images", file));
    }
    const uploadHeaders = { headers: { 'x-user-role': 'admin' } };
    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct._id}`, data, uploadHeaders);
        showToast("success", "Product updated successfully");
      } else {
        await axios.post(`${API}/products`, data, uploadHeaders);
        showToast("success", "Product created successfully");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err.response?.data || err);
      showToast("error", err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, adminHeaders);
      showToast("success", "Product deleted");
      fetchProducts();
    } catch (err) {
      showToast("error", "Failed to delete product");
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
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button 
              className={`topbar-btn ${selectedCategories.length > 0 ? 'border-action text-action bg-action/5' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Plus size={14} className={isFilterOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
              {selectedCategories.length > 0 ? `${selectedCategories.length} Categories` : 'All Categories'}
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filter Categories</span>
                  {selectedCategories.length > 0 && (
                    <button onClick={() => setSelectedCategories([])} className="text-[10px] font-bold text-action hover:underline uppercase">Clear</button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar space-y-1">
                  {categories.map(cat => (
                    <label key={cat._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedCategories.includes(cat._id) ? 'bg-action border-action' : 'border-gray-200 group-hover:border-action/50'}`}>
                        {selectedCategories.includes(cat._id) && <Check size={10} color="white" strokeWidth={4} />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={selectedCategories.includes(cat._id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCategories([...selectedCategories, cat._id]);
                          else setSelectedCategories(selectedCategories.filter(id => id !== cat._id));
                        }}
                      />
                      <span className={`text-xs font-bold ${selectedCategories.includes(cat._id) ? 'text-primary' : 'text-gray-500'}`}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="topbar-btn" onClick={() => setShowImport(true)} title="Bulk Import CSV">
            <Upload size={14} /> Import
          </button>
          <button className="topbar-btn" onClick={() => setShowExport(true)} title="Export CSV">
            <Download size={14} /> Export
          </button>
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
              <th>Categories</th>
              <th>Variants</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr 
                key={p._id} 
                onClick={() => handleOpenModal(p)}
                className="cursor-pointer hover:bg-gray-50/80 transition-all group"
              >
                <td>
                  <div className="prod-cell">
                    {p.image ? (
                      <img src={getImageUrl(p.image)} alt="" className="prod-thumb shadow-sm group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="prod-thumb-ph">{p.name[0]}</div>
                    )}
                    <span className="prod-name group-hover:text-action transition-colors">{p.name}</span>
                  </div>
                </td>
                <td><span className="sku-tag font-mono text-[10px]">{p.sku || 'N/A'}</span></td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(p.category) ? (
                      p.category.map(cat => (
                        <span key={cat._id} className="cat-tag bg-blue-50 text-blue-600 border-blue-100 text-[9px] py-1">
                          {cat.name}
                        </span>
                      ))
                    ) : (
                      <span className="cat-tag">{p.category?.name || 'Uncategorized'}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    {(p.variants || []).map((v, idx) => (
                      <div key={idx} className="text-[10px] whitespace-nowrap">
                        <span className="font-bold text-gray-400 uppercase mr-1">{v.name}:</span>
                        <span className="text-gray-600">{(v.options || []).join(', ')}</span>
                      </div>
                    ))}
                    {(!p.variants || p.variants.length === 0) && <span className="text-gray-300 text-[10px italic]">No variants</span>}
                  </div>
                </td>
                <td>
                  <span className={`status-tag ${p.isActive ? 's-delivered' : 's-cancelled'}`}>
                    <i></i> {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="row-acts" onClick={e => e.stopPropagation()}>
                    <button className="icon-btn danger hover:bg-red-50" onClick={() => handleDelete(p._id)} title="Delete Product">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan="8" className="empty-row">No products found</td></tr>
            )}
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
                <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-r2">
                    <div className="fg">
                      <label>Product Name</label>
                      <input required type="text" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="fg">
                      <label>SKU (Internal Code)</label>
                      <input type="text" value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                    </div>
                  </div>



                  <div className="fg">
                    <label>Description</label>
                    <textarea required rows="3" value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>


                  <div className="form-r3">
                    <div className="fg sm:col-span-2">
                      <label>Categories (Select one or more)</label>
                      <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 max-h-48 overflow-y-auto no-scrollbar">
                        {categories.map(cat => (
                          <label key={cat._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-200">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded accent-action"
                              checked={Array.isArray(formData.category) ? formData.category.includes(cat._id) : formData.category === cat._id}
                              onChange={(e) => {
                                const currentCats = Array.isArray(formData.category) ? formData.category : (formData.category ? [formData.category] : []);
                                if (e.target.checked) {
                                  setFormData({ ...formData, category: [...currentCats, cat._id] });
                                } else {
                                  setFormData({ ...formData, category: currentCats.filter(id => id !== cat._id) });
                                }
                              }}
                            />
                            <span className="text-xs font-bold text-gray-700">{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="fg">
                      <label>Stock Count</label>
                      <input required type="number" value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                    </div>
                  </div>

                  <div className="fg">
                    <label>Primary Image</label>
                    <div className="upload-wrap">
                      <label className="upload-box">
                        <input type="file" className="hidden-input" onChange={handleImageChange} />
                        {imagePreview ? (
                          <img src={imagePreview} className="upload-preview" alt="Preview" />
                        ) : (
                          <><ImageIcon size={20} /><span>Click to upload</span></>
                        )}
                      </label>
                      {imagePreview && (
                        <button type="button" className="remove-img"
                          onClick={() => { setImagePreview(""); setImageFile(null); }}>
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="fg">
                    <label>Additional Photos</label>
                    <div className="upload-wrap" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <label className="upload-box" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                        <input type="file" multiple className="hidden-input" onChange={handleMultipleImagesChange} />
                        <ImageIcon size={20} />
                        <span style={{ fontSize: '10px' }}>Upload</span>
                      </label>
                      {imagesPreviews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Preview ${i}`} />
                          <button type="button" 
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}
                            onClick={() => {
                              const newPreviews = [...imagesPreviews];
                              newPreviews.splice(i, 1);
                              setImagesPreviews(newPreviews);
                              
                              const newFiles = [...imagesFiles];
                              newFiles.splice(i, 1);
                              setImagesFiles(newFiles);
                            }}>
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Variants Section */}
                  <div className="fg" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--card2)', marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <label style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Variants</label>
                      <button type="button" 
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => {
                          const newVariants = [...(formData.variants || []), { name: '', options: [] }];
                          setFormData({ ...formData, variants: newVariants });
                        }}>
                        <Plus size={14} /> Add option
                      </button>
                    </div>

                    {(formData.variants || []).map((variant, vIdx) => (
                      <div key={vIdx} style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', marginBottom: '4px' }}>Option name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Size or Color"
                              value={variant.name} 
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[vIdx].name = e.target.value;
                                setFormData({ ...formData, variants: newVariants });
                              }} 
                              style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                          </div>
                          <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '12px', marginBottom: '4px' }}>Option values (comma separated)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. S, M, L"
                              value={(variant.options || []).join(', ')} 
                              onBlur={(e) => {
                                const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                                const newVariants = [...formData.variants];
                                newVariants[vIdx].options = vals;
                                
                                // Regenerate combinations
                                let newItems = [];
                                if (newVariants.length > 0 && newVariants.every(v => v.options.length > 0)) {
                                  const combos = newVariants.reduce((a, b) => a.flatMap(x => b.options.map(y => [...x, y])), [[]]);
                                  newItems = combos.map(combo => {
                                    const comboKey = combo.join(' / ');
                                    const existing = (formData.variantItems || []).find(vi => vi.combination === comboKey);
                                    return existing || { 
                                      combination: comboKey, 
                                      retailPrice: formData.retailPrice || 0, 
                                      wholesalePrice: formData.wholesalePrice || 0, 
                                      stock: 0 
                                    };

                                  });
                                }
                                setFormData({ ...formData, variants: newVariants, variantItems: newItems });
                              }}
                              onChange={(e) => {
                                // Allow typing
                                const newVariants = [...formData.variants];
                                newVariants[vIdx].options = e.target.value.split(','); // temporary string state technically, but this allows typing naturally
                                setFormData({ ...formData, variants: newVariants });
                              }}
                              style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                          </div>
                          <button type="button" 
                            style={{ marginTop: '22px', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}
                            onClick={() => {
                              const newVariants = [...formData.variants];
                              newVariants.splice(vIdx, 1);
                              
                              let newItems = [];
                              if (newVariants.length > 0 && newVariants.every(v => v.options.length > 0)) {
                                const combos = newVariants.reduce((a, b) => a.flatMap(x => b.options.map(y => [...x, y])), [[]]);
                                newItems = combos.map(combo => {
                                  const comboKey = combo.join(' / ');
                                  const existing = (formData.variantItems || []).find(vi => vi.combination === comboKey);
                                  return existing || { 
                                    combination: comboKey, 
                                    retailPrice: formData.retailPrice || 0, 
                                    wholesalePrice: formData.wholesalePrice || 0, 
                                    stock: 0 
                                  };

                                });
                              }
                              setFormData({ ...formData, variants: newVariants, variantItems: newItems });
                            }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Variant Combinations Table */}
                    {formData.variantItems && formData.variantItems.length > 0 && (
                      <div style={{ marginTop: '20px', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 'bold', width: '35%' }}>Variant</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 'bold', width: '40%' }}>Price (Retail/Wholesale)</th>

                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 'bold', width: '30%' }}>Available</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.variantItems.map((item, iIdx) => (
                              <tr key={iIdx} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '8px 12px', fontWeight: '500' }}>{item.combination}</td>
                                <td style={{ padding: '8px 12px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text3)', minWidth: '45px' }}>RETAIL</span>
                                      <input 
                                        type="number" 
                                        placeholder="Retail"
                                        value={item.retailPrice} 
                                        onChange={(e) => {
                                          const newItems = [...formData.variantItems];
                                          newItems[iIdx].retailPrice = Number(e.target.value);
                                          setFormData({ ...formData, variantItems: newItems });
                                        }}
                                        style={{ flex: 1, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px' }}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#059669', minWidth: '45px' }}>DEALER</span>
                                      <input 
                                        type="number" 
                                        placeholder="Wholesale"
                                        value={item.wholesalePrice} 
                                        onChange={(e) => {
                                          const newItems = [...formData.variantItems];
                                          newItems[iIdx].wholesalePrice = Number(e.target.value);
                                          setFormData({ ...formData, variantItems: newItems });
                                        }}
                                        style={{ flex: 1, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px', background: '#ecfdf5' }}
                                      />
                                    </div>
                                  </div>
                                </td>

                                <td style={{ padding: '8px 12px' }}>
                                  <input 
                                    type="number" 
                                    placeholder="Wholesale"
                                    value={item.wholesalePrice ?? ''} 
                                    onChange={(e) => {
                                      const newItems = [...formData.variantItems];
                                      newItems[iIdx].wholesalePrice = e.target.value === '' ? '' : Number(e.target.value);
                                      setFormData({ ...formData, variantItems: newItems });
                                    }}
                                    style={{ width: '100%', padding: '6px', border: '1px solid var(--border)', borderRadius: '4px' }}
                                  />
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <input 
                                    type="number" 
                                    value={item.stock ?? ''} 
                                    onChange={(e) => {
                                      const newItems = [...formData.variantItems];
                                      newItems[iIdx].stock = e.target.value === '' ? '' : Number(e.target.value);
                                      setFormData({ ...formData, variantItems: newItems });
                                    }}
                                    style={{ width: '100%', padding: '6px', border: '1px solid var(--border)', borderRadius: '4px' }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input type="checkbox" checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                      Active for Sale
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input type="checkbox" checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
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

      {/* Import / Export Modals */}
      {showImport && (
        <BulkImportModal
          onClose={() => setShowImport(false)}
          categories={categories}
          onImportDone={fetchProducts}
          showToast={showToast}
        />
      )}
      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          filteredProducts={filteredProducts}
          showToast={showToast}
        />
      )}
    </div>
  );
}